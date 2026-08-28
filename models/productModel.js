import pool from '../config/db.js';
import { buildProductImageUrl } from '../utils/fileUrl.js';

// ─── CREATE ────────────────────────────────────────────────────────────────

export const createProduct = async (
    name, description, price, imageUrl, inStock,
    storageType, size, categoryId, brandId,
    // NEW CRM fields - all optional so existing callers still work
    costPrice = 0, unit = null, vatPercent = 0, stockQuantity = 0, lowStockThreshold = 10
) => {
    const query = `
        INSERT INTO products (
            name, description, price, image_url, in_stock,
            storage_type, size, category_id, brand_id,
            cost_price, unit, vat_percent, stock_quantity, low_stock_threshold
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *;
    `;

    const values = [
        name, description, price, imageUrl,
        // Auto-derive in_stock from stockQuantity if stockQuantity was provided,
        // otherwise fall back to the explicit inStock flag for backwards compat.
        stockQuantity > 0 ? true : (inStock === 'true' || inStock === true),
        storageType, size, categoryId, brandId,
        Number(costPrice), unit, Number(vatPercent),
        Number(stockQuantity), Number(lowStockThreshold)
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// ─── READ ALL (with filters + pagination) ───────────────────────────────────

export const getAllProducts = async (filters) => {
    const {
        search, brand, brandId, category, categoryId,
        storageType, size, minPrice, maxPrice, inStock,
        page = 1, limit = 10
    } = filters;

    const offset = (Number(page) - 1) * Number(limit);

    let where = ` WHERE 1=1 `;
    const values = [];
    let index = 1;

    if (search) {
        where += ` AND (p.name ILIKE $${index} OR p.description ILIKE $${index})`;
        values.push(`%${search}%`); index++;
    }
    if (brand) {
        where += ` AND b.name ILIKE $${index}`;
        values.push(`%${brand}%`); index++;
    }
    if (brandId) {
        where += ` AND b.id = $${index}`;
        values.push(brandId); index++;
    }
    if (category) {
        where += ` AND c.name ILIKE $${index}`;
        values.push(`%${category}%`); index++;
    }
    if (categoryId) {
        where += ` AND c.id = $${index}`;
        values.push(categoryId); index++;
    }
    if (storageType) {
        where += ` AND p.storage_type ILIKE $${index}`;
        values.push(`%${storageType}%`); index++;
    }
    if (size) {
        where += ` AND p.size ILIKE $${index}`;
        values.push(`%${size}%`); index++;
    }
    if (minPrice) {
        where += ` AND p.price >= $${index}`;
        values.push(Number(minPrice)); index++;
    }
    if (maxPrice) {
        where += ` AND p.price <= $${index}`;
        values.push(Number(maxPrice)); index++;
    }
    if (typeof inStock !== 'undefined') {
        where += ` AND p.in_stock = $${index}`;
        values.push(inStock === 'true'); index++;
    }

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ${where}
    `;
    const totalResult = await pool.query(countQuery, values);
    const total = Number(totalResult.rows[0].total);

    const dataQuery = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.cost_price       AS "costPrice",
            p.unit,
            p.vat_percent      AS "vatPercent",
            p.stock_quantity   AS "stockQuantity",
            p.low_stock_threshold AS "lowStockThreshold",
            p.image_url        AS "imageUrl",
            p.rating,
            p.review_count     AS "reviewCount",
            p.in_stock         AS "inStock",
            p.storage_type     AS "storageType",
            p.size,
            c.name             AS category,
            c.id               AS "categoryId",
            b.name             AS brand,
            b.id               AS "brandId"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        ${where}
        ORDER BY p.id DESC
        LIMIT $${index} OFFSET $${index + 1}
    `;

    const result = await pool.query(dataQuery, [...values, Number(limit), offset]);

    const products = await Promise.all(
        result.rows.map(async (product) => {
            const imagesRes = await pool.query(
                `SELECT image_url AS "imageUrl" FROM product_images WHERE product_id = $1`,
                [product.id]
            );
            return {
                ...product,
                imageUrl: buildProductImageUrl(product.imageUrl),
                images: imagesRes.rows.map(img => buildProductImageUrl(img.imageUrl)),
                // Computed stock status used by CRM list (Image 4)
                stockStatus: stockStatus(product.stockQuantity, product.lowStockThreshold)
            };
        })
    );

    return {
        products,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
            hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
            hasPreviousPage: Number(page) > 1
        }
    };
};

// ─── READ ONE ──────────────────────────────────────────────────────────────

export const getProductById = async (id) => {
    const productRes = await pool.query(`
        SELECT
            p.id, p.name, p.description,
            p.price,
            p.cost_price       AS "costPrice",
            p.unit,
            p.vat_percent      AS "vatPercent",
            p.stock_quantity   AS "stockQuantity",
            p.low_stock_threshold AS "lowStockThreshold",
            p.image_url        AS "imageUrl",
            p.rating,
            p.review_count     AS "reviewCount",
            p.in_stock         AS "inStock",
            p.storage_type     AS "storageType",
            p.size,
            c.name             AS "categoryName",
            c.id               AS "categoryId",
            b.name             AS "brandName",
            b.id               AS "brandId"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = $1
    `, [id]);

    if (!productRes.rows[0]) return null;
    const product = productRes.rows[0];

    const imagesRes = await pool.query(
        `SELECT image_url AS "imageUrl" FROM product_images WHERE product_id = $1`,
        [id]
    );

    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        costPrice: Number(product.costPrice || 0),
        unit: product.unit,
        vatPercent: Number(product.vatPercent || 0),
        stockQuantity: Number(product.stockQuantity || 0),
        lowStockThreshold: Number(product.lowStockThreshold || 10),
        imageUrl: buildProductImageUrl(product.imageUrl),
        images: imagesRes.rows.map(i => buildProductImageUrl(i.imageUrl)),
        rating: Number(product.rating || 0),
        reviewCount: Number(product.reviewCount || 0),
        inStock: product.inStock,
        storageType: product.storageType,
        size: product.size,
        category: product.categoryName,
        categoryId: product.categoryId,
        brand: product.brandName,
        brandId: product.brandId,
        stockStatus: stockStatus(product.stockQuantity, product.lowStockThreshold)
    };
};

// ─── UPDATE ────────────────────────────────────────────────────────────────

export const updateProduct = async (
    id, name, description, price, imageUrl, inStock,
    storageType, size, categoryId, brandId,
    // NEW CRM fields - undefined = don't change
    costPrice, unit, vatPercent, stockQuantity, lowStockThreshold
) => {
    // Resolve stock status: if stockQuantity was supplied use it to set inStock,
    // otherwise keep the explicit inStock value for backwards compat.
    const stockQty = stockQuantity != null ? Number(stockQuantity) : null;
    const derivedInStock = stockQty != null
        ? stockQty > 0
        : (inStock === 'true' || inStock === true);

    const query = `
        UPDATE products
        SET
            name              = $1,
            description       = $2,
            price             = $3,
            image_url         = COALESCE($4, image_url),
            in_stock          = $5,
            storage_type      = $6,
            size              = $7,
            category_id       = $8,
            brand_id          = $9,
            cost_price        = COALESCE($10, cost_price),
            unit              = COALESCE($11, unit),
            vat_percent       = COALESCE($12, vat_percent),
            stock_quantity    = COALESCE($13, stock_quantity),
            low_stock_threshold = COALESCE($14, low_stock_threshold)
        WHERE id = $15
        RETURNING *;
    `;

    const values = [
        name, description, price,
        imageUrl || null,
        derivedInStock,
        storageType, size, categoryId, brandId,
        costPrice != null ? Number(costPrice) : null,
        unit ?? null,
        vatPercent != null ? Number(vatPercent) : null,
        stockQty,
        lowStockThreshold != null ? Number(lowStockThreshold) : null,
        id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// ─── DELETE ────────────────────────────────────────────────────────────────

export const deleteProduct = async (id) => {
    const result = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

// ─── IMAGES ────────────────────────────────────────────────────────────────

export const saveProductImages = async (productId, images) => {
    for (const image of images) {
        await pool.query(
            `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`,
            [productId, image]
        );
    }
};

export const replaceProductImages = async (productId, images) => {
    await pool.query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
    for (const image of images) {
        await pool.query(
            `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`,
            [productId, image]
        );
    }
};

// ─── STOCK QUERIES (for CRM alerts + Image 4 status badges) ───────────────

// Returns all products where stock_quantity <= low_stock_threshold.
// Powers the "Low Stock Alerts" menu item visible in Image 5.
export const getLowStockProducts = async () => {
    const result = await pool.query(`
        SELECT
            p.id, p.name, p.stock_quantity AS "stockQuantity",
            p.low_stock_threshold AS "lowStockThreshold",
            c.name AS category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock_quantity <= p.low_stock_threshold
        ORDER BY p.stock_quantity ASC
    `);
    return result.rows;
};

// Adjust stock by a delta (positive = restock, negative = sale/damage).
// Used by the sales flow when an order is placed or a delivery received.
export const adjustStock = async (productId, delta) => {
    const result = await pool.query(`
        UPDATE products
        SET
            stock_quantity = GREATEST(0, stock_quantity + $1),
            in_stock       = (GREATEST(0, stock_quantity + $1) > 0)
        WHERE id = $2
        RETURNING id, name, stock_quantity AS "stockQuantity", in_stock AS "inStock"
    `, [delta, productId]);
    return result.rows[0];
};

// ─── HELPER ────────────────────────────────────────────────────────────────

// Returns the string badge value shown in Image 4 (In Stock / Low Stock / Out of Stock)
function stockStatus(qty, threshold) {
    const q = Number(qty || 0);
    const t = Number(threshold || 10);
    if (q === 0) return 'Out of Stock';
    if (q <= t)  return 'Low Stock';
    return 'In Stock';
}
import pool from '../config/db.js';
import fs from 'fs';
import { buildProductImageUrl } from '../utils/fileUrl.js';


export const createProduct = async (
    name,
    description,
    price,
    imageUrl,
    inStock,
    storageType,
    size,
    categoryId,
    brandId
) => {
    const query = `
        INSERT INTO products (
            name,
            description,
            price,
            image_url,
            in_stock,
            storage_type,
            size,
            category_id,
            brand_id
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *;
    `;

    const values = [
        name,
        description,
        price,
        imageUrl,
        inStock,
        storageType,
        size,
        categoryId,
        brandId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export const getAllProducts = async (filters) => {
    const {
        search,
        brand,
        category,
        storageType,
        size,
        minPrice,
        maxPrice,
        inStock,
        page = 1,
        limit = 10
    } = filters;

    const offset = (Number(page) - 1) * Number(limit);

    let query = `
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.image_url AS "imageUrl",
            p.rating,
            p.review_count AS "reviewCount",
            p.in_stock AS "inStock",
            p.storage_type AS "storageType",
            p.size,
            c.name AS category,
            b.name AS brand
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE 1=1
    `;

    const values = [];
    let index = 1;

    if (search) {
        query += `
            AND (
                p.name ILIKE $${index}
                OR p.description ILIKE $${index}
            )
        `;
        values.push(`%${search}%`);
        index++;
    }

    if (brand) {
        query += ` AND b.name ILIKE $${index}`;
        values.push(`%${brand}%`);
        index++;
    }

    if (category) {
        query += ` AND c.name ILIKE $${index}`;
        values.push(`%${category}%`);
        index++;
    }

    if (storageType) {
        query += ` AND p.storage_type ILIKE $${index}`;
        values.push(`%${storageType}%`);
        index++;
    }

    if (size) {
        query += ` AND p.size ILIKE $${index}`;
        values.push(`%${size}%`);
        index++;
    }

    if (minPrice) {
        query += ` AND p.price >= $${index}`;
        values.push(Number(minPrice));
        index++;
    }

    if (maxPrice) {
        query += ` AND p.price <= $${index}`;
        values.push(Number(maxPrice));
        index++;
    }

    if (typeof inStock !== 'undefined') {
        query += ` AND p.in_stock = $${index}`;
        values.push(inStock === 'true');
        index++;
    }

    query += `
        ORDER BY p.id DESC
        LIMIT $${index}
        OFFSET $${index + 1}
    `;

    values.push(Number(limit));
    values.push(offset);

    const result = await pool.query(query, values);

    return result.rows.map(product => ({
        ...product,
        imageUrl: buildProductImageUrl(product.imageUrl)
    }));
};


export const getProductById = async (id) => {
    const productRes = await pool.query(`
        SELECT
            p.id,
            p.name,
            p.description,
            p.price,
            p.image_url AS "imageUrl",
            p.rating,
            p.review_count AS "reviewCount",
            p.in_stock AS "inStock",
            p.storage_type AS "storageType",
            p.size,
            c.name AS "categoryName",
            b.name AS "brandName"
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = $1
    `, [id]);

    if (!productRes.rows[0]) return null;

    const product = productRes.rows[0];

    const imagesRes = await pool.query(`
        SELECT image_url AS "imageUrl"
        FROM product_images
        WHERE product_id = $1
    `, [id]);

    // const reviewsRes = await pool.query(`
    //     SELECT
    //         r.id,
    //         r.product_id,
    //         r.user_id,
    //         r.rating,
    //         r.title,
    //         r.comment,
    //         r.review_date,
    //         u.name AS user_name,
    //         u.profile_image_url
    //     FROM reviews r
    //     LEFT JOIN users u ON u.id = r.user_id
    //     WHERE r.product_id = $1
    //     ORDER BY r.id DESC
    // `, [id]);




    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        imageUrl: buildProductImageUrl(product.imageUrl),
        images: imagesRes.rows.map((i) => buildProductImageUrl(i.imageUrl)),
        rating: Number(product.rating || 0),
        reviewCount: Number(product.review_count || 0),
        inStock: product.inStock,
        storageType: product.storageType,
        size: product.size,
        category: product.categoryName,
        brand: product.brandName,

        // reviews: reviewsRes.rows.map(r => ({
        //     id: r.id,
        //     productId: r.product_id,
        //     userId: r.user_id,
        //     userName: r.user_name,
        //     userImageUrl: r.profile_image_url,
        //     rating: r.rating,
        //     title: r.title,
        //     comment: r.comment,
        //     reviewDate: r.review_date
        // }))
    };
};

export const updateProduct = async (
    id,
    name,
    description,
    price,
    imageUrl,
    inStock,
    storageType,
    size,
    categoryId,
    brandId
) => {
    const query = `
        UPDATE products
        SET
            name = $1,
            description = $2,
            price = $3,
            image_url = COALESCE($4, image_url),
            in_stock = $5,
            storage_type = $6,
            size = $7,
            category_id = $8,
            brand_id = $9
        WHERE id = $10
        RETURNING *;
    `;

    const values = [
        name,
        description,
        price,
        imageUrl || null,   // IMPORTANT
        inStock,
        storageType,
        size,
        categoryId,
        brandId,
        id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteProduct = async (id) => {
    const result = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0];
};


export const saveProductImages = async (
    productId,
    images
) => {
    for (const image of images) {
        await pool.query(
            `
            INSERT INTO product_images
            (product_id, image_url)
            VALUES ($1, $2)
            `,
            [productId, image]
        );
    }
};



export const replaceProductImages = async (productId, images) => {
    await pool.query(
        `DELETE FROM product_images WHERE product_id = $1`,
        [productId]
    );

    for (const image of images) {
        await pool.query(
            `INSERT INTO product_images (product_id, image_url)
             VALUES ($1, $2)`,
            [productId, image]
        );
    }
};



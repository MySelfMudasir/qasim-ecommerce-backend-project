import pool from '../config/db.js';
import { buildProductImageUrl } from '../utils/fileUrl.js';

export const createOrder = async (orderData) => {
    const { userId, total, items, paymentStatus, orderStatus } = orderData;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderResult = await client.query(`
            INSERT INTO orders (
                id, user_id, total, mode,
                shipping_first_name, shipping_last_name, shipping_address, shipping_city, shipping_zip_code, shipping_state, shipping_country,
                collection_location, collection_date, collection_time,
                payment_status, order_status
            )
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            userId, total, orderData.mode,
            orderData.shipping?.firstName || null,
            orderData.shipping?.lastName || null,
            orderData.shipping?.address || null,
            orderData.shipping?.city || null,
            orderData.shipping?.zipCode || null,
            orderData.shipping?.state || null,
            orderData.shipping?.country || null,

            orderData.collection?.collectionLocation || null,
            orderData.collection?.collectionDate || null,
            orderData.collection?.collectionTime || null,
            paymentStatus,
            orderStatus
        ]);

        for (const item of items) {
            const quantity = Number(item.quantity);
            const productId = item.product.id;

            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error(`Invalid quantity for product ${productId}`);
            }

            const stockResult = await client.query(`
                UPDATE products
                SET stock_quantity = stock_quantity - $1,
                    in_stock = (stock_quantity - $1 > 0)
                WHERE id = $2 AND stock_quantity >= $1
                RETURNING id
            `, [quantity, productId]);

            if (stockResult.rowCount === 0) {
                throw new Error(`Insufficient stock for product ${productId}`);
            }

            await client.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)
            `, [orderResult.rows[0].id, productId, quantity, item.product.price]);
        }

        await client.query('DELETE FROM cart WHERE user_id = $1', [userId]);
        await client.query('COMMIT');
        return orderResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};



export const getOrdersByUser = async (userId, orderStatus) => {
    let query = `
        SELECT
            o.*,
            oi.*,
            p.*,
            c.name AS category_name,
            b.name AS brand_name
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE o.user_id = $1
    `;

    const params = [userId];

    if (orderStatus) {
        params.push(orderStatus);
        query += ` AND o.order_status = $${params.length}`;
    }

    if (orderStatus === 'all') {
        query = query.replace('AND o.order_status = $' + params.length, '');
        params.pop();
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);
    console.log(result.rows);
    // return result.rows;
    return result.rows.map(row => ({
        id: String(row.product_id),
        name: row.name,
        price: parseFloat(row.price),
        imageUrl: buildProductImageUrl(row.image_url),
        description: row.description,
        categoryId: String(row.category_id),
        rating: parseFloat(row.rating),
        reviewCount: row.review_count,
        inStock: row.in_stock,
        category: row.category_name,
        brand: row.brand_name,
        storageType: row.storage_type,
        size: row.size,
        quantity: row.quantity,

        shipping: row.mode == 'delivery' ? {
            firstName: row.shipping_first_name,
            lastName: row.shipping_last_name,
            shippingAddress: row.shipping_address,
            shippingCity: row.shipping_city,
            shippingZipCode: row.shipping_zip_code,
            shippingState: row.shipping_state,
            shippingCountry: row.shipping_country
        } : null,
        collection: row.mode == 'collection' ? {
            collectionLocation: row.collection_location,
            collectionDate: row.collection_date,
            collectionTime: row.collection_time,
        } : null,
        userId: row.user_id,
        orderStatus: row.order_status,
        paymentStatus: row.payment_status,
        orderId: row.order_id,
        mode: row.mode,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }));
};


export const getOrdersByAdmin = async (orderStatus, page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params = [];

    if (orderStatus && orderStatus !== 'all') {
        params.push(orderStatus);
        whereClause = `WHERE o.order_status = $${params.length}`;
    }

    const addFilter = (condition, value) => {
        params.push(value);
        const parameter = `$${params.length}`;
        whereClause += whereClause ? ` AND ${condition.replace('$VALUE', parameter)}` : `WHERE ${condition.replace('$VALUE', parameter)}`;
    };

    if (filters.fromDate) addFilter('DATE(o.created_at) >= $VALUE', filters.fromDate);
    if (filters.toDate) addFilter('DATE(o.created_at) <= $VALUE', filters.toDate);
    if (filters.orderId) addFilter('o.order_number ILIKE $VALUE', `%${filters.orderId}%`);
    if (filters.customerName) addFilter("CONCAT_WS(' ', u.first_name, u.last_name) ILIKE $VALUE", `%${filters.customerName}%`);

    // Count total orders (not rows)
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const total = Number(countResult.rows[0].total);

    // Pagination
    params.push(limit);
    const limitIndex = params.length;

    params.push(offset);
    const offsetIndex = params.length;

    const query = `
        WITH paged_orders AS (
            SELECT o.id
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ${whereClause}
            ORDER BY o.created_at DESC
            LIMIT $${limitIndex}
            OFFSET $${offsetIndex}
        )
        SELECT
            o.id AS internal_order_id,
            o.order_number AS invoice_number,
            o.collection_location,
            o.collection_date,
            o.collection_time,
            o.created_at AS order_created_at,
            o.updated_at AS order_updated_at,
            o.shipping_first_name,
            o.shipping_last_name,
            o.shipping_address,
            o.shipping_city,
            o.shipping_state,
            o.shipping_country,
            o.shipping_zip_code,
            o.user_id,
            o.total,
            o.mode,
            o.order_status,
            o.payment_status,

            oi.*,
            p.*,

            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number,
            u.city AS user_city,
            u.state AS user_state,
            u.zip_code AS user_zip_code,
            u.street_address AS user_street_address,
            u.country AS user_country,

            c.name AS category_name,
            b.name AS brand_name

        FROM orders o
        JOIN paged_orders po ON po.id = o.id
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN users u ON u.id = o.user_id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id

        ORDER BY o.created_at DESC, oi.id ASC
    `;

    const result = await pool.query(query, params);

    return {
        orders: result.rows.map(row => ({
            id: String(row.product_id),
            name: row.name,
            price: parseFloat(row.price),
            imageUrl: buildProductImageUrl(row.image_url),
            description: row.description,
            categoryId: String(row.category_id),
            rating: parseFloat(row.rating),
            reviewCount: row.review_count,
            inStock: row.in_stock,
            category: row.category_name,
            brand: row.brand_name,
            storageType: row.storage_type,
            size: row.size,
            quantity: row.quantity,

            user: {
                id: row.user_id,
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                phone: row.phone_number,
                address: {
                    street: row.user_street_address,
                    city: row.user_city,
                    state: row.user_state,
                    zipCode: row.user_zip_code,
                    country: row.user_country
                }
            },

            shipping: row.mode === 'delivery'
                ? {
                    firstName: row.shipping_first_name,
                    lastName: row.shipping_last_name,
                    shippingAddress: row.shipping_address,
                    shippingCity: row.shipping_city,
                    shippingZipCode: row.shipping_zip_code,
                    shippingState: row.shipping_state,
                    shippingCountry: row.shipping_country
                }
                : null,

            collection: row.mode === 'collection'
                ? {
                    collectionLocation: row.collection_location,
                    collectionDate: row.collection_date,
                    collectionTime: row.collection_time
                }
                : null,

            orderId: row.invoice_number,
            internalOrderId: row.internal_order_id,
            orderStatus: row.order_status,
            paymentStatus: row.payment_status,
            mode: row.mode,
            createdAt: row.order_created_at,
            updatedAt: row.order_updated_at
        })),

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    };
};


export const approveOrderByAdmin = async (orderId, orderStatus) => {
    const query = `
        UPDATE orders
        SET order_status = $1,
        updated_at = NOW()
        WHERE id = $2
        RETURNING *;
    `;

    const params = [orderStatus, orderId];
    const result = await pool.query(query, params);
    return result.rows[0];
};

export const updatePaymentStatusByAdmin = async (orderId, paymentStatus) => {
    const query = `
        UPDATE orders
        SET payment_status = $1,
        updated_at = NOW()
        WHERE id = $2
        RETURNING *;
    `;

    const params = [paymentStatus, orderId];
    const result = await pool.query(query, params);
    return result.rows[0];
};

export const deleteOrderById = async (orderId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const items = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1 FOR UPDATE', [orderId]);

        for (const item of items.rows) {
            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity + $1, in_stock = true WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
        const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const updateOrderByAdmin = async (orderId, orderData) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingItems = await client.query(
            'SELECT product_id, quantity FROM order_items WHERE order_id = $1 FOR UPDATE',
            [orderId]
        );

        for (const item of existingItems.rows) {
            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity + $1, in_stock = true WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        const customer = orderData.customer || {};
        await client.query(`
            UPDATE users SET
                first_name = $1, last_name = $2, email = $3, phone_number = $4,
                street_address = $5, city = $6, state = $7, zip_code = $8, country = $9
            WHERE id = (SELECT user_id FROM orders WHERE id = $10)
        `, [
            customer.firstName, customer.lastName, customer.email, customer.phone,
            customer.address?.street || null, customer.address?.city || null,
            customer.address?.state || null, customer.address?.zipCode || null,
            customer.address?.country || null, orderId
        ]);

        await client.query(`
            UPDATE orders SET
                total = $1, mode = $2, payment_status = $3, order_status = $4,
                shipping_first_name = $5, shipping_last_name = $6, shipping_address = $7,
                shipping_city = $8, shipping_zip_code = $9, shipping_state = $10,
                shipping_country = $11, collection_location = $12, collection_date = $13,
                collection_time = $14, updated_at = NOW()
            WHERE id = $15
        `, [
            Number(orderData.total), orderData.mode, orderData.paymentStatus, orderData.orderStatus,
            orderData.shipping?.firstName || null, orderData.shipping?.lastName || null,
            orderData.shipping?.shippingAddress || null, orderData.shipping?.shippingCity || null,
            orderData.shipping?.shippingZipCode || null, orderData.shipping?.shippingState || null,
            orderData.shipping?.shippingCountry || null, orderData.collection?.collectionLocation || null,
            orderData.collection?.collectionDate || null, orderData.collection?.collectionTime || null, orderId
        ]);

        await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
        for (const item of orderData.items || []) {
            const quantity = Number(item.quantity);
            const productId = Number(item.id);
            if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(productId)) {
                throw new Error('Each order item must have a valid product and quantity');
            }

            const stockResult = await client.query(`
                UPDATE products
                SET stock_quantity = stock_quantity - $1,
                    in_stock = (stock_quantity - $1 > 0)
                WHERE id = $2 AND stock_quantity >= $1
                RETURNING id
            `, [quantity, productId]);
            if (stockResult.rowCount === 0) throw new Error(`Insufficient stock for product ${productId}`);

            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, productId, quantity, Number(item.price)]
            );
        }

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
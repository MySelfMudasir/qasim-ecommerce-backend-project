import pool from '../config/db.js';
import { randomUUID } from 'crypto';
import { buildProductImageUrl } from '../utils/fileUrl.js';

export const createOrder = async (orderData) => {
    const randomOrderId = randomUUID();
    const { id = randomOrderId, userId, total, items, paymentStatus, orderStatus } = orderData;

    const orderResult = await pool.query(`
        INSERT INTO orders (
            id, user_id, total, mode,
            shipping_first_name, shipping_last_name, shipping_address, shipping_city, shipping_zip_code,
            collection_location, collection_date, collection_time, 
            payment_status, order_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
    `, [
        id, userId, total, orderData.mode,
        orderData.shipping?.firstName || null,
        orderData.shipping?.lastName || null,
        orderData.shipping?.address || null,
        orderData.shipping?.city || null,
        orderData.shipping?.zipCode || null,

        orderData.collection?.collectionLocation || null,
        orderData.collection?.collectionDate || null,
        orderData.collection?.collectionTime || null,
        paymentStatus,
        orderStatus
    ]);

    // Insert order items
    for (const item of items) {
        await pool.query(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)
        `, [id, item.product.id, item.quantity, item.product.price]);
    }

    // Clear user's cart after order placed
    await pool.query(
        'DELETE FROM cart WHERE user_id = $1',
        [orderData.userId]
    );

    return orderResult.rows[0];
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
        } : null,
        collection: row.mode == 'collection' ? {
            collectionLocation: row.collection_location,
            collectionDate: row.collection_date,
            collectionTime: row.collection_time,
        } : null,
        userId: row.user_id,
        orderStatus: row.order_status,
        paymentStatus: row.payment_status,
        orderStatus: row.order_status,
        orderId: row.order_id,
        paymentStatus: row.payment_status,
        mode: row.mode
    }));
};


export const getOrdersByAdmin = async (orderStatus) => {
let query = `
    SELECT
        o.*,
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
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN users u ON u.id = o.user_id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
`;

    const params = [];

    // Apply filter only when status is not "all"
    if (orderStatus && orderStatus !== 'all') {
        params.push(orderStatus);
        query += ` WHERE o.order_status = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);

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

    shipping: row.mode === 'delivery' ? {
        firstName: row.shipping_first_name,
        lastName: row.shipping_last_name,
        shippingAddress: row.shipping_address,
        shippingCity: row.shipping_city,
        shippingZipCode: row.shipping_zip_code,
    } : null,

    collection: row.mode === 'collection' ? {
        collectionLocation: row.collection_location,
        collectionDate: row.collection_date,
        collectionTime: row.collection_time,
    } : null,

    orderId: row.order_id,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    mode: row.mode
}));
};


export const approveOrderByAdmin = async (orderId, orderStatus) => {
    const query = `
        UPDATE orders
        SET order_status = $1
        WHERE id = $2
        RETURNING *;
    `;

    const params = [orderStatus, orderId];
    const result = await pool.query(query, params);
    return result.rows[0];
};
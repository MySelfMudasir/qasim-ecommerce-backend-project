import pool from '../config/db.js';
import { randomUUID } from 'crypto';

export const createOrder = async (orderData) => {
    const randomOrderId = randomUUID();
    const {
        id = randomOrderId,
        userId,
        total,
        items,
        paymentStatus
    } = orderData;

    const shippingAddress = orderData.shipping ? `${orderData.shipping.firstName} ${orderData.shipping.lastName}, ${orderData.shipping.address}, ${orderData.shipping.city}, ${orderData.shipping.state} ${orderData.shipping.zipCode}`: null;

    const orderResult = await pool.query(`
        INSERT INTO orders (
            id, user_id, total, mode,
            shipping_address, collection_location,
            collection_date, collection_time, payment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `, [
        id, userId, total, orderData.mode,
        shippingAddress,
        orderData.collectionLocation || null,
        orderData.collectionDate || null,
        orderData.collectionTime || null,
        paymentStatus
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

export const getOrdersByUser = async (userId) => {
    const result = await pool.query(`
        SELECT 
        o.*
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `, [userId]);
    
    return result.rows;
};
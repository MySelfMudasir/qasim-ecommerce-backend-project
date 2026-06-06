import pool from '../config/db.js';
import fs from 'fs';
import { buildProductImageUrl } from '../utils/fileUrl.js';

export const createWishlistItem = async (userId, productId) => {
    const existing = await pool.query(
        `SELECT id,
        user_id AS "userId",
        product_id AS "productId" FROM wishlist
        WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
    );

    if (existing.rows.length > 0) {
        throw new Error('Product already exists in wishlist');
    }

    const result = await pool.query(
        `INSERT INTO wishlist(user_id, product_id)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, productId]
    );

    return result.rows[0];
};

export const getAllWishlistItems = async (userId) => {
    const result = await pool.query(`
        SELECT 
        w.id,
        p.id AS product_id,
        p.name,
        p.price,
        p.image_url AS "imageUrl",
        p.description,
        p.category_id AS "categoryId",
        p.rating,
        p.review_count AS "reviewCount",
        p.in_stock AS "inStock"
        FROM wishlist w
        JOIN products p ON p.id = w.product_id
        WHERE w.user_id = $1
    `, [userId]);

    return result.rows.map(row => ({
        id: String(row.product_id),
        name: row.name,
        price: parseFloat(row.price),
        imageUrl: buildProductImageUrl(row.imageUrl),
        description: row.description,
        categoryId: String(row.categoryId),
        rating: parseFloat(row.rating),
        reviewCount: row.reviewCount,
        inStock: row.inStock,
        reviews: []
    }));
};

export const deleteAllWishlistItems = async (userId) => {
    const result = await pool.query(
        'DELETE FROM wishlist WHERE user_id = $1 RETURNING *',
        [userId]
    );

    return result.rows;
};

export const deleteWishlistItem = async (userId, productId) => {
    const result = await pool.query(
        `DELETE FROM wishlist
         WHERE user_id = $1
         AND product_id = $2
         RETURNING *`,
        [userId, productId]
    );

    return result.rows[0];
};
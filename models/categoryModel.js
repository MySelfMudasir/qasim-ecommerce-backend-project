import pool from '../config/db.js';
import fs from 'fs';
import { buildProductImageUrl } from '../utils/fileUrl.js';


export const createCategory = async (
    name
) => {
    const query = `
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING *;
    `;

    const values = [name];

    const result = await pool.query(query, values);

    return result.rows[0];
};


export const getAllCategories = async () => {
    const result = await pool.query(`
        SELECT id, name
        FROM categories
        ORDER BY name
    `);
    return result.rows;
}



export const updateCategory = async (
    id,
    name
) => {
    const query = `
        UPDATE categories
        SET name = $1
        WHERE id = $2
        RETURNING *;
    `;

    const values = [name, id];

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteCategory = async (id) => {
    const result = await pool.query(
        'DELETE FROM categories WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0];
};




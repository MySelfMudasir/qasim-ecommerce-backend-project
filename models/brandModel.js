import pool from '../config/db.js';
import fs from 'fs';
import { buildProductImageUrl } from '../utils/fileUrl.js';


export const createBrand = async (
    name
) => {
    const query = `
        INSERT INTO brands (name)
        VALUES ($1)
        RETURNING *;
    `;

    const values = [name];

    const result = await pool.query(query, values);

    return result.rows[0];
};


export const getAllBrands = async () => {
    const result = await pool.query(`
        SELECT id, name
        FROM brands
        ORDER BY id ASC
    `);
    return result.rows;
}



export const updateBrand = async (
    id,
    name
) => {
    const query = `
        UPDATE brands
        SET name = $1
        WHERE id = $2
        RETURNING *;
    `;

    const values = [name, id];

    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteBrand = async (id) => {
    const result = await pool.query(
        'DELETE FROM brands WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0];
};




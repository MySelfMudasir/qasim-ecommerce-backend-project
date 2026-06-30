import pool from '../config/db.js';

export const getUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0];
};


export const getUserById = async (id) => {

    const result = await pool.query(
        `
        SELECT
        id,
        email,
        role,
        is_active
        FROM users
        WHERE id = $1
        `,
        [id]
    );
    return result.rows[0];
};
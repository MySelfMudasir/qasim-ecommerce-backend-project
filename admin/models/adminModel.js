import pool from '../../config/db.js';

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

export const createUser = async (firstName, email, hashedPassword, phoneNumber, lastName, displayName) => {
    const query = `
        INSERT INTO users (
            first_name,
            email,
            password,
            phone_number,
            last_name,
            display_name,
            role,
            is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'ADMIN', true)
        RETURNING *;
        `;

    const values = [firstName, email, hashedPassword, phoneNumber, lastName, displayName];

    const result = await pool.query(query, values);

    return result.rows[0];
};
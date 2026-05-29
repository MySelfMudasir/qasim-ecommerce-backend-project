import pool from '../config/db.js';

export const createUser = async (name, email) => {
    const query = `
    INSERT INTO users(name, email)
    VALUES($1, $2)
    RETURNING *;
  `;

    const values = [name, email];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export const getAllUsers = async () => {
    const result = await pool.query(
        'SELECT * FROM users ORDER BY id DESC'
    );

    return result.rows;
};

export const getUserById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );

    return result.rows[0];
};

export const updateUser = async (id, name, email) => {
    const query = `
    UPDATE users
    SET name = $1,
        email = $2
    WHERE id = $3
    RETURNING *;
  `;

    const values = [name, email, id];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export const deleteUser = async (id) => {
    const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0];
};
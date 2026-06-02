import pool from '../config/db.js';

export const createUser = async (
    firstName,
    email,
    hashedPassword,
    phoneNumber,
    lastName,
    displayName,
    streetAddress,
    city,
    state,
    zipCode,
    country,
    businessName,
    businessType,
    primaryCategory,
    monthlyOrders,
    emailUpdates,
    smsUpdates,
    marketingUpdates
) => {
    const query = `
    INSERT INTO users(
        first_name,
        email,
        password,
        phone_number,
        last_name,
        display_name,
        street_address,
        city,
        state,
        zip_code,
        country,
        business_name,
        business_type,
        primary_category,
        monthly_orders,
        email_updates,
        sms_updates,
        marketing_updates
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *;
  `;

    const values = [
        firstName,
        email,
        hashedPassword,
        phoneNumber,
        lastName,
        displayName,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        businessName,
        businessType,
        primaryCategory,
        monthlyOrders,
        emailUpdates,
        smsUpdates,
        marketingUpdates,
    ];

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
import pool from '../config/db.js';

export const createUser = async (firstName, email, hashedPassword, phoneNumber, lastName, displayName, streetAddress, city, state, zipCode, country, businessName, businessType, primaryCategory, monthlyOrders, emailUpdates, smsUpdates, marketingUpdates) => {
    const query = `
    INSERT INTO users( first_name, email, password, phone_number, last_name, display_name, street_address, city, state, zip_code, country, business_name, business_type, primary_category, monthly_orders, email_updates, sms_updates, marketing_updates, role = 'USER', is_active = true, checkout_mode = 'collection')
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING *;
  `;

    const values = [firstName, email, hashedPassword, phoneNumber, lastName, displayName, streetAddress, city, state, zipCode, country, businessName, businessType, primaryCategory, monthlyOrders, emailUpdates, smsUpdates, marketingUpdates, role];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export const getAllUsers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const totalResult = await pool.query(
        `SELECT COUNT(*) FROM users`
    );

    const total = Number(totalResult.rows[0].count);

    const result = await pool.query(
        `SELECT *
        FROM users
        ORDER BY id DESC
        LIMIT $1
        OFFSET $2 `, [limit, offset]
    );

    return {
        users: result.rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page < Math.ceil(total / limit), hasPreviousPage: page > 1 }
    };
};

export const getUserById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );

    return result.rows[0];
};

export const updateUser = async (id, data) => {
    const query = `
        UPDATE users
        SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            display_name = COALESCE($3, display_name),
            email = COALESCE($4, email),
            password = COALESCE($5, password),
            phone_number = COALESCE($6, phone_number),
            street_address = COALESCE($7, street_address),
            city = COALESCE($8, city),
            state = COALESCE($9, state),
            zip_code = COALESCE($10, zip_code),
            country = COALESCE($11, country),
            business_name = COALESCE($12, business_name),
            business_type = COALESCE($13, business_type),
            primary_category = COALESCE($14, primary_category),
            monthly_orders = COALESCE($15, monthly_orders),
            email_updates = COALESCE($16, email_updates),
            sms_updates = COALESCE($17, sms_updates),
            marketing_updates = COALESCE($18, marketing_updates),
            role = COALESCE($19, role),
            is_active = COALESCE($20, is_active),
            checkout_mode = COALESCE($21, checkout_mode)
        WHERE id = $22
        RETURNING *;
    `;

    const values = [data.first_name, data.last_name, data.display_name, data.email, data.password, data.phone_number, data.street_address, data.city, data.state, data.zip_code, data.country, data.business_name, data.business_type, data.primary_category, data.monthly_orders, data.email_updates, data.sms_updates, data.marketing_updates, data.role, data.is_active, data.checkout_mode, id];

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
import pool from '../config/db.js';
import fs from 'fs';
import { buildProductImageUrl } from '../utils/fileUrl.js';

export const getSalesReport = async (fromDate, toDate, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const countQuery = `
        SELECT COUNT(*) AS total_records,
               COALESCE(SUM(total),0) AS total_sales
        FROM orders
        WHERE DATE(created_at) BETWEEN $1 AND $2
    `;

    const countResult = await pool.query(countQuery, [fromDate, toDate]);

    const dataQuery = `
        SELECT
            id,
            user_id,
            total,
            payment_status,
            order_status,
            mode,
            collection_location,
            collection_date,
            shipping_first_name,
            shipping_last_name,
            shipping_city,
            shipping_country,
            created_at
        FROM orders
        WHERE DATE(created_at) BETWEEN $1 AND $2
        ORDER BY created_at DESC
        LIMIT $3 OFFSET $4
    `;

    const { rows } = await pool.query(dataQuery, [
        fromDate,
        toDate,
        limit,
        offset,
    ]);

    return {
        summary: {
            totalSales: Number(countResult.rows[0].total_sales),
            totalOrders: Number(countResult.rows[0].total_records),
        },
        pagination: {
            page,
            limit,
            totalRecords: Number(countResult.rows[0].total_records),
            totalPages: Math.ceil(
                Number(countResult.rows[0].total_records) / limit
            ),
        },
        orders: rows,
    };
};
import pool from '../config/db.js';
import fs from 'fs';
import { buildProductImageUrl } from '../utils/fileUrl.js';

export const getSalesReport = async (
    fromDate,
    toDate,
    page = 1,
    limit = 10
) => {
    const offset = (page - 1) * limit;

    const params = [fromDate, toDate];

    // Total orders count
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM orders o
        WHERE DATE(o.created_at) BETWEEN $1 AND $2
    `;

    const countResult = await pool.query(countQuery, params);
    const total = Number(countResult.rows[0].total);

    // Pagination
    params.push(limit);
    const limitIndex = params.length;

    params.push(offset);
    const offsetIndex = params.length;

    const query = `
        SELECT
            o.id AS order_id,
            o.collection_location,
            o.collection_date,
            o.collection_time,
            o.created_at AS order_created_at,
            o.updated_at AS order_updated_at,
            o.shipping_first_name,
            o.shipping_last_name,
            o.shipping_address,
            o.shipping_city,
            o.shipping_state,
            o.shipping_country,
            o.shipping_zip_code,
            o.user_id,
            o.total,
            o.mode,
            o.order_status,
            o.payment_status,

            oi.quantity,
            oi.price AS item_price,

            p.id AS product_id,
            p.name,
            p.price,
            p.image_url,
            p.description,
            p.category_id,
            p.rating,
            p.review_count,
            p.in_stock,
            p.storage_type,
            p.size,

            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number,
            u.city AS user_city,
            u.state AS user_state,
            u.zip_code AS user_zip_code,
            u.street_address AS user_street_address,
            u.country AS user_country,

            c.name AS category_name,
            b.name AS brand_name

        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN users u ON u.id = o.user_id
        LEFT JOIN categories c ON c.id = p.category_id
        LEFT JOIN brands b ON b.id = p.brand_id

        WHERE DATE(o.created_at) BETWEEN $1 AND $2

        ORDER BY o.created_at DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
    `;

    const result = await pool.query(query, params);

    return {
        orders: result.rows.map(row => ({
            id: String(row.product_id),
            name: row.name,
            price: parseFloat(row.price),
            imageUrl: buildProductImageUrl(row.image_url),
            description: row.description,
            categoryId: String(row.category_id),
            rating: parseFloat(row.rating),
            reviewCount: row.review_count,
            inStock: row.in_stock,
            category: row.category_name,
            brand: row.brand_name,
            storageType: row.storage_type,
            size: row.size,
            quantity: row.quantity,

            user: {
                id: row.user_id,
                firstName: row.first_name,
                lastName: row.last_name,
                email: row.email,
                phone: row.phone_number,
                address: {
                    street: row.user_street_address,
                    city: row.user_city,
                    state: row.user_state,
                    zipCode: row.user_zip_code,
                    country: row.user_country
                }
            },

            shipping:
                row.mode === "delivery"
                    ? {
                          firstName: row.shipping_first_name,
                          lastName: row.shipping_last_name,
                          shippingAddress: row.shipping_address,
                          shippingCity: row.shipping_city,
                          shippingZipCode: row.shipping_zip_code,
                          shippingState: row.shipping_state,
                          shippingCountry: row.shipping_country
                      }
                    : null,

            collection:
                row.mode === "collection"
                    ? {
                          collectionLocation: row.collection_location,
                          collectionDate: row.collection_date,
                          collectionTime: row.collection_time
                      }
                    : null,

            orderId: row.order_id,
            total: parseFloat(row.total),
            orderStatus: row.order_status,
            paymentStatus: row.payment_status,
            mode: row.mode,
            createdAt: row.order_created_at,
            updatedAt: row.order_updated_at
        })),

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    };
};
import {
    createProduct, getAllProducts, getProductById,
    updateProduct, deleteProduct,
    saveProductImages, replaceProductImages,
    getLowStockProducts, adjustStock
} from '../models/productModel.js';

import { successResponse, errorResponse } from '../utils/response.js';

// ─── CREATE ─────────────────────────────────────────────────────────────────

export const create = async (req, res, next) => {
    try {
        const {
            name, description, price, categoryId, brandId,
            storageType, size, inStock,
            // NEW CRM fields from the Add Product form (Image 1)
            costPrice, unit, vatPercent, stockQuantity, lowStockThreshold
        } = req.body;

        const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
        const gallery   = req.files?.gallery?.map(f => f.filename) || [];

        const product = await createProduct(
            name, description, price, thumbnail, inStock,
            storageType, size, categoryId, brandId,
            costPrice, unit, vatPercent, stockQuantity, lowStockThreshold
        );

        if (gallery.length > 0) {
            await saveProductImages(product.id, gallery);
        }

        return successResponse(res, 'Product created successfully', product, 201);
    } catch (error) {
        next(error);
    }
};

// ─── READ ALL ───────────────────────────────────────────────────────────────

export const findAll = async (req, res, next) => {
    try {
        const result = await getAllProducts(req.query);
        return successResponse(res, 'Products fetched successfully', {
            products: result.products,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// ─── READ ONE ───────────────────────────────────────────────────────────────

export const findOne = async (req, res, next) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) return errorResponse(res, 'Product not found', 404);
        return successResponse(res, 'Product fetched successfully', product);
    } catch (error) {
        next(error);
    }
};

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export const update = async (req, res, next) => {
    try {
        const {
            name, description, price, inStock, storageType, size, categoryId, brandId,
            // NEW CRM fields
            costPrice, unit, vatPercent, stockQuantity, lowStockThreshold
        } = req.body;

        const thumbnail = req.files?.thumbnail?.[0]?.filename;
        const gallery   = req.files?.gallery?.map(f => f.filename) || [];

        const product = await updateProduct(
            req.params.id,
            name, description, price, thumbnail, inStock,
            storageType, size, categoryId, brandId,
            costPrice, unit, vatPercent, stockQuantity, lowStockThreshold
        );

        if (!product) return errorResponse(res, 'Product not found', 404);

        if (gallery.length > 0) {
            await replaceProductImages(product.id, gallery);
        }

        return successResponse(res, 'Product updated successfully', product);
    } catch (error) {
        next(error);
    }
};

// ─── DELETE ─────────────────────────────────────────────────────────────────

export const remove = async (req, res, next) => {
    try {
        const product = await deleteProduct(req.params.id);
        if (!product) return errorResponse(res, 'Product not found', 404);
        return successResponse(res, 'Product deleted successfully', product);
    } catch (error) {
        next(error);
    }
};

// ─── STOCK ──────────────────────────────────────────────────────────────────

// GET /api/products/low-stock
// Powers the "Low Stock Alerts" page visible in Image 5.
export const lowStock = async (req, res, next) => {
    try {
        const products = await getLowStockProducts();
        return successResponse(res, 'Low stock products fetched', products);
    } catch (error) {
        next(error);
    }
};

// PATCH /api/products/:id/stock
// Body: { delta: number }  (positive = restock, negative = sale/write-off)
// Used by the sales flow to decrement stock when an order is confirmed.
export const patchStock = async (req, res, next) => {
    try {
        const { delta } = req.body;
        if (delta == null || isNaN(Number(delta))) {
            return errorResponse(res, 'delta is required and must be a number', 400);
        }
        const updated = await adjustStock(req.params.id, Number(delta));
        if (!updated) return errorResponse(res, 'Product not found', 404);
        return successResponse(res, 'Stock updated', updated);
    } catch (error) {
        next(error);
    }
};
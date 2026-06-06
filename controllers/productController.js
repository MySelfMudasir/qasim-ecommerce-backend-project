import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    saveProductImages,
    replaceProductImages,
} from '../models/productModel.js';

import {
    successResponse,
    errorResponse
} from '../utils/response.js';

export const create = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            categoryId,
            brandId,
            storageType,
            size,
            inStock
        } = req.body;

        const thumbnail =
            req.files?.thumbnail?.[0]?.filename || null;

        const gallery =
            req.files?.gallery?.map(
                file => file.filename
            ) || [];

        const product = await createProduct(
            name,
            description,
            price,
            thumbnail,
            inStock,
            storageType,
            size,
            categoryId,
            brandId
        );

        if (gallery.length > 0) {
            await saveProductImages(
                product.id,
                gallery
            );
        }

        return successResponse(
            res,
            'Product created successfully',
            product,
            201
        );
    } catch (error) {
        next(error);
    }
};

export const findAll = async (req, res, next) => {
    try {
        const products = await getAllProducts(req.query);

        return successResponse(
            res,
            'Products fetched successfully',
            products
        );

    } catch (error) {
        next(error);
    }
};

export const findOne = async (req, res, next) => {
    try {
        const product = await getProductById(req.params.id);

        if (!product) {
            return errorResponse(
                res,
                'Product not found',
                404
            );
        }

        return successResponse(
            res,
            'Product fetched successfully',
            product
        );
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            inStock,
            storageType,
            size,
            categoryId,
            brandId
        } = req.body;

        const thumbnail =
            req.files?.thumbnail?.[0]?.filename;

        const gallery =
            req.files?.gallery?.map(file => file.filename) || [];

        // 1. Update product first
        const product = await updateProduct(
            req.params.id,
            name,
            description,
            price,
            thumbnail,
            inStock,
            storageType,
            size,
            categoryId,
            brandId
        );

        if (!product) {
            return errorResponse(res, 'Product not found', 404);
        }

        // 2. PUT THIS HERE 👇 (right after updateProduct)
        if (gallery.length > 0) {
            await replaceProductImages(product.id, gallery);
        }

        return successResponse(
            res,
            'Product updated successfully',
            product
        );

    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const product = await deleteProduct(req.params.id);

        if (!product) {
            return errorResponse(
                res,
                'Product not found',
                404
            );
        }

        return successResponse(
            res,
            'Product deleted successfully',
            product
        );
    } catch (error) {
        next(error);
    }
};

import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from '../models/categoryModel.js';

import {
    successResponse,
    errorResponse
} from '../utils/response.js';

export const create = async (req, res, next) => {
    try {
        const {
            name,
        } = req.body;

        const category = await createCategory(
            name,
        );

        return successResponse(
            res,
            'Category created successfully',
            category,
            201
        );
    } catch (error) {
        next(error);
    }
};

export const findAll = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        return successResponse(
            res,
            'Categories fetched successfully',
            categories
        );
    } catch (error) {
        next(error);
    }
};



export const update = async (req, res, next) => {
    try {
        const {
            name,
        } = req.body;

        // 1. Update category first
        const category = await updateCategory(
            req.params.id,
            name
        );

        if (!category) {
            return errorResponse(res, 'Category not found', 404);
        }


        return successResponse(
            res,
            'Category updated successfully',
            category
        );

    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const category = await deleteCategory(req.params.id);

        if (!category) {
            return errorResponse(
                res,
                'Category not found',
                404
            );
        }

        return successResponse(
            res,
            'Category deleted successfully',
            category
        );
    } catch (error) {
        next(error);
    }
};

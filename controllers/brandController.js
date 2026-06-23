import {
    createBrand,
    getAllBrands,
    updateBrand,
    deleteBrand
} from '../models/brandModel.js';

import {
    successResponse,
    errorResponse
} from '../utils/response.js';

export const create = async (req, res, next) => {
    try {
        const {
            name,
        } = req.body;

        const brand = await createBrand(
            name,
        );

        return successResponse(
            res,
            'brand created successfully',
            brand,
            201
        );
    } catch (error) {
        next(error);
    }
};

export const findAll = async (req, res, next) => {
    try {
        const brands = await getAllBrands();
        return successResponse(
            res,
            'Brands fetched successfully',
            brands
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

        // 1. Update brand first
        const brand = await updateBrand(
            req.params.id,
            name
        );

        if (!brand) {
            return errorResponse(res, 'brand not found', 404);
        }


        return successResponse(
            res,
            'brand updated successfully',
            brand
        );

    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const brand = await deleteBrand(req.params.id);

        if (!brand) {
            return errorResponse(
                res,
                'brand not found',
                404
            );
        }

        return successResponse(
            res,
            'brand deleted successfully',
            brand
        );
    } catch (error) {
        next(error);
    }
};

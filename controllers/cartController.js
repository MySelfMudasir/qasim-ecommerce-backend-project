import {
    createCartItem,
    getAllCartItems,
    deleteCartItem,
    deleteAllCartItems
} from '../models/cartModel.js';

import {
    successResponse,
    errorResponse
} from '../utils/response.js';

export const create = async (req, res, next) => {
    try {
        // Pull both variables straight from req.body
        const { userId, productId } = req.body;

        const CartItem = await createCartItem(
            userId,
            productId
        );

        return successResponse(
            res,
            'Cart item added successfully',
            CartItem,
            201
        );
    } catch (error) {
        next(error);
    }
};

export const findAll = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const CartItems = await getAllCartItems(userId);

        return successResponse(
            res,
            'Cart items fetched successfully',
            CartItems
        );
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        // Pull both variables straight from req.body
        const { userId, productId } = req.body;

        const CartItem = await deleteCartItem(
            userId,
            productId
        );

        if (!CartItem) {
            return errorResponse(
                res,
                'Cart item not found',
                404
            );
        }

        return successResponse(
            res,
            'Cart item deleted successfully',
            CartItem
        );
    } catch (error) {
        next(error);
    }
};

export const removeAll = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const CartItems = await deleteAllCartItems(userId);

        return successResponse(
            res,
            'All Cart items deleted successfully',
            CartItems
        );
    } catch (error) {
        next(error);
    }
};
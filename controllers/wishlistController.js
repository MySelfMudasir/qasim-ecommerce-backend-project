import {
    createWishlistItem,
    getAllWishlistItems,
    deleteWishlistItem,
    deleteAllWishlistItems
} from '../models/wishlistModel.js';

import {
    successResponse,
    errorResponse
} from '../utils/response.js';

export const create = async (req, res, next) => {
    try {
        // Pull both variables straight from req.body
        const { userId, productId } = req.body;

        const WishlistItem = await createWishlistItem(
            userId,
            productId
        );

        return successResponse(
            res,
            'Wishlist item added successfully',
            WishlistItem,
            201
        );
    } catch (error) {
        next(error);
    }
};

export const findAll = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const WishlistItems = await getAllWishlistItems(userId);

        return successResponse(
            res,
            'Wishlist items fetched successfully',
            WishlistItems
        );
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        // Pull both variables straight from req.body
        const { userId, productId } = req.body;

        const WishlistItem = await deleteWishlistItem(
            userId,
            productId
        );

        if (!WishlistItem) {
            return errorResponse(
                res,
                'Wishlist item not found',
                404
            );
        }

        return successResponse(
            res,
            'Wishlist item deleted successfully',
            WishlistItem
        );
    } catch (error) {
        next(error);
    }
};

export const removeAll = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const WishlistItems = await deleteAllWishlistItems(userId);

        return successResponse(
            res,
            'All Wishlist items deleted successfully',
            WishlistItems
        );
    } catch (error) {
        next(error);
    }
};
import { createOrder, getOrdersByUser } from '../models/orderModel.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const placeOrder = async (req, res, next) => {
    try {
        const order = await createOrder(req.body);
        return successResponse(res, 'Order placed successfully', order, 201);
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const orders = await getOrdersByUser(userId);
        return successResponse(res, 'Orders fetched successfully', orders);
    } catch (error) {
        next(error);
    }
};
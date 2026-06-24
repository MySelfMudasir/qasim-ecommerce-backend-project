import { approveOrderByAdmin, createOrder, getOrdersByAdmin, getOrdersByUser } from '../models/orderModel.js';
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
        const { userId, orderStatus} = req.body;
        const orders = await getOrdersByUser(userId, orderStatus);
        return successResponse(res, 'Orders fetched successfully', orders);
    } catch (error) {
        next(error);
    }
};

export const getAdminOrders = async (req, res, next) => {
    try {
        const { orderStatus} = req.body;
        const orders = await getOrdersByAdmin(orderStatus);
        return successResponse(res, 'Orders fetched successfully', orders);
    } catch (error) {
        next(error);
    }
};

export const approveOrder = async (req, res, next) => {
    try {
        const { orderId, orderStatus } = req.body;
        const order = await approveOrderByAdmin(orderId, orderStatus);
        return successResponse(res, 'Order approved successfully');
    } catch (error) {
        next(error);
    }
};
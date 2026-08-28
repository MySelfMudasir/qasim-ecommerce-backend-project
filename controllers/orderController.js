import { approveOrderByAdmin, createOrder, getOrdersByAdmin, getOrdersByUser, updatePaymentStatusByAdmin, deleteOrderById, updateOrderByAdmin } from '../models/orderModel.js';
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
        const { userId, orderStatus } = req.body;
        const orders = await getOrdersByUser(userId, orderStatus);
        return successResponse(res, 'Orders fetched successfully', orders);
    } catch (error) {
        next(error);
    }
};

export const getAdminOrders = async (req, res, next) => {
    try {
        const { orderStatus = 'all', page = 1, limit = 10, fromDate, toDate, orderId, customerName } = req.body;
        const orders = await getOrdersByAdmin(orderStatus, page, limit, { fromDate, toDate, orderId, customerName });
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

export const updatePaymentStatus = async (req, res, next) => {
    try {
        const { orderId, paymentStatus } = req.body;
        const order = await updatePaymentStatusByAdmin(orderId, paymentStatus);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        return successResponse(res, 'Payment status updated successfully', order);
    } catch (error) {
        next(error);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await deleteOrderById(orderId);
        if (!order) {
            return errorResponse(res, 'Order not found', 404);
        }
        return successResponse(res, 'Order deleted successfully', order);
    } catch (error) {
        next(error);
    }
};

export const updateOrder = async (req, res, next) => {
    try {
        await updateOrderByAdmin(req.params.orderId, req.body);
        return successResponse(res, 'Order updated successfully');
    } catch (error) {
        next(error);
    }
};
import express from 'express';
import { verifyToken } from '../src/middlewares/auth.js';
import { approveOrder, getAdminOrders, getUserOrders, placeOrder, updatePaymentStatus, deleteOrder, updateOrder } from '../controllers/orderController.js';
import { authorize } from '../src/middlewares/authorize.js';
    
const router = express.Router();

router.post('/place', verifyToken, placeOrder);
router.post('/all', verifyToken, getUserOrders);
router.post('/getOrders', verifyToken, authorize('ADMIN'), getAdminOrders);
router.post('/approveOrder', verifyToken, authorize('ADMIN'), approveOrder);
router.put('/:orderId', verifyToken, authorize('ADMIN'), updateOrder);
router.post('/updatePaymentStatus', verifyToken, authorize('ADMIN'), updatePaymentStatus);
router.delete('/:orderId', verifyToken, authorize('ADMIN'), deleteOrder);

export default router;
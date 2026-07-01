import express from 'express';
import { verifyToken } from '../src/middlewares/auth.js';
import { approveOrder, getAdminOrders, getUserOrders, placeOrder } from '../controllers/orderController.js';
import { authorize } from '../src/middlewares/authorize.js';
    
const router = express.Router();

router.post('/place', verifyToken, placeOrder);
router.post('/all', verifyToken, getUserOrders);
router.post('/getOrders', verifyToken, authorize('ADMIN'), getAdminOrders);
router.post('/approveOrder', verifyToken, authorize('ADMIN'), approveOrder);

export default router;
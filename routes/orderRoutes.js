import express from 'express';
import { verifyCookies, verifyToken } from '../src/middlewares/auth.js';
import { approveOrder, getAdminOrders, getUserOrders, placeOrder } from '../controllers/orderController.js';

const router = express.Router();

// All interactions now use base routes; data is handled inside req.body
router.post('/place', placeOrder);
router.post('/all', getUserOrders);
router.post('/admin/all', getAdminOrders);
router.post('/admin/approve', approveOrder);

export default router;
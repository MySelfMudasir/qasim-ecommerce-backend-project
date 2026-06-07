import express from 'express';
import { verifyCookies, verifyToken } from '../src/middlewares/auth.js';
import { getUserOrders, placeOrder } from '../controllers/orderController.js';

const router = express.Router();

// All interactions now use base routes; data is handled inside req.body
router.post('/place', verifyToken, placeOrder);
router.post('/all', verifyToken, getUserOrders);

export default router;
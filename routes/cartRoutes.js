import express from 'express';
import { verifyCookies, verifyToken } from '../src/middlewares/auth.js';
import { create, findAll, removeAll, remove } from '../controllers/cartController.js';
import { upload } from '../src/middlewares/upload.js';

const router = express.Router();

// All interactions now use base routes; data is handled inside req.body
router.post('/add', verifyToken, create);
router.all('/all', verifyToken, findAll);
router.post('/remove', verifyToken, remove);
router.post('/clear', verifyToken, removeAll);

export default router;
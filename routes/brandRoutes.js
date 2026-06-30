import express from 'express';
import { verifyToken } from '../src/middlewares/auth.js';
import { create, findAll, update, remove } from '../controllers/brandController.js';
import { upload } from '../src/middlewares/upload.js';
import { authorize } from '../src/middlewares/authorize.js';

const router = express.Router();


router.post('/', verifyToken, authorize('ADMIN'), create);
router.get('/', findAll);
router.put('/:id', verifyToken, authorize('ADMIN'), update);
router.delete('/:id', verifyToken, authorize('ADMIN'), remove);


export default router;
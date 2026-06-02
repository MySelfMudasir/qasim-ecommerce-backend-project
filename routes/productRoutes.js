import express from 'express';
import { verifyToken } from '../src/middlewares/auth.js';
import { create, findAll, findOne, update, remove } from '../controllers/userController.js';

const router = express.Router();

router.post('/', verifyToken, create);
router.get('/', verifyToken, findAll);
router.get('/:id', verifyToken, findOne);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, remove);

export default router;
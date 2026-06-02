import express from 'express';
import { create, findAll, findOne, update, remove } from '../controllers/userController.js';
import { verifyToken } from '../src/middlewares/auth.js';


const router = express.Router();

router.post('/', verifyToken, create);
router.get('/', verifyToken, findAll);
router.get('/:id', verifyToken, findOne);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, remove);

export default router;
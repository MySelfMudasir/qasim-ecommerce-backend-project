import express from 'express';
import { create, findAll, findOne, update, remove } from '../controllers/userController.js';
import { createUserValidation } from '../src/validators/user.validator.js';
import { verifyToken } from '../src/middlewares/auth.js';
import { authorize } from '../src/middlewares/authorize.js';

const router = express.Router();

router.post('/', createUserValidation, verifyToken, authorize('ADMIN'), create);
router.get('/', verifyToken, authorize('ADMIN'), findAll);
router.get('/:id', verifyToken, authorize('ADMIN'), findOne);
router.put('/:id', verifyToken, authorize('ADMIN'), update);
router.delete('/:id', verifyToken, authorize('ADMIN'), remove);

export default router;
import express from 'express';
import { verifyCookies, verifyToken } from '../src/middlewares/auth.js';
import { create, findAll, update, remove } from '../controllers/categoryController.js';
import { upload } from '../src/middlewares/upload.js';

const router = express.Router();


router.post('/', verifyToken, create);
router.get('/', verifyToken, findAll);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, remove);


export default router;
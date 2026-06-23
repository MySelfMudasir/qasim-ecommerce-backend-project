import express from 'express';
import { verifyCookies, verifyToken } from '../src/middlewares/auth.js';
import { create, findAll, update, remove } from '../controllers/brandController.js';
import { upload } from '../src/middlewares/upload.js';

const router = express.Router();


router.post('/', create);
router.get('/', findAll);
router.put('/:id', update);
router.delete('/:id', remove);


export default router;
import express from 'express';
import { verifyToken } from '../src/middlewares/auth.js';
import { authorize } from '../src/middlewares/authorize.js';
import { create, findAll, findOne, update, remove } from '../controllers/productController.js';
import { upload } from '../src/middlewares/upload.js';

const router = express.Router();


router.post(
    '/',
    verifyToken, authorize('ADMIN'),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'gallery', maxCount: 10 }
    ]),
    create
);

router.get('/', findAll);
router.get('/:id', findOne);

router.delete('/:id', 
    verifyToken, authorize('ADMIN'),
    remove);

router.put(
    '/:id',
    verifyToken, authorize('ADMIN'),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'gallery', maxCount: 10 }
    ]),
    update
);


export default router;
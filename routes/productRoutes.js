import express from 'express';
import { verifyCookies, verifyToken } from '../src/middlewares/auth.js';
import { create, findAll, findOne, update, remove } from '../controllers/productController.js';
import { upload } from '../src/middlewares/upload.js';

const router = express.Router();


router.post(
    '/',
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'gallery', maxCount: 10 }
    ]),
    create
);

router.get('/', findAll);
router.get('/:id', findOne);
router.delete('/:id', remove);

router.put(
    '/:id',
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'gallery', maxCount: 10 }
    ]),
    update
);


export default router;
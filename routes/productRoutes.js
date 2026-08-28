import express from 'express';
import { verifyToken } from '../src/middlewares/auth.js';
import { authorize } from '../src/middlewares/authorize.js';
import { upload } from '../src/middlewares/upload.js';
import {
    create, findAll, findOne,
    update, remove,
    lowStock, patchStock
} from '../controllers/productController.js';

const router = express.Router();

// ── Public / e-commerce routes (unchanged) ──────────────────────────────────
router.get('/', findAll);
router.get('/:id', findOne);

// ── CRM stock routes ────────────────────────────────────────────────────────
// Must be declared BEFORE /:id so 'low-stock' isn't treated as an id param.
router.get(
    '/low-stock',
    verifyToken, authorize('ADMIN'),
    lowStock
);

router.patch(
    '/:id/stock',
    verifyToken, authorize('ADMIN'),
    patchStock
);

// ── Admin CRUD routes ───────────────────────────────────────────────────────
router.post(
    '/',
    verifyToken, authorize('ADMIN'),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'gallery',   maxCount: 10 }
    ]),
    create
);

router.put(
    '/:id',
    verifyToken, authorize('ADMIN'),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'gallery',   maxCount: 10 }
    ]),
    update
);

router.delete(
    '/:id',
    verifyToken, authorize('ADMIN'),
    remove
);

export default router;
import express from 'express';

import { create, findAll, findOne, update, remove } from '../controllers/userController.js';

const router = express.Router();

router.post('/', create);

router.get('/', findAll);

router.get('/:id', findOne);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;
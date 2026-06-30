import express from 'express';
import { getToken, login, logout, register } from '../controllers/adminController.js';
import { verifyToken } from '../../src/middlewares/auth.js';


const router = express.Router();

router.post('/generateToken', getToken);
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);


export default router;
import express from 'express';
import { checkEmail, getToken, login, logout, register } from '../controllers/authController.js';


const router = express.Router();

router.post('/generateToken', getToken);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/register', register);
router.post('/logout', logout);


export default router;
import express from 'express';
import { getToken, login, register } from '../controllers/authController.js';


const router = express.Router();

router.post('/generateToken', getToken);
router.post('/login', login);
router.post('/register', register);


export default router;
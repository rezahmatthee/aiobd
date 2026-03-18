import { Router } from 'express';
import { register, login, logout } from '../controllers/auth';
import { validateAuthInput } from '../middleware/validation';

const router = Router();

router.post('/register', validateAuthInput, register);
router.post('/login', validateAuthInput, login);
router.post('/logout', logout);

export default router;

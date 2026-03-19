import { Router } from 'express';
import { register, login, logout, refreshToken } from '../controllers/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { asyncHandler } from '../middleware/error';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validateRegistration, asyncHandler(register));
router.post('/login', validateLogin, asyncHandler(login));
router.post('/logout', authenticate, asyncHandler(logout));
router.post('/refresh', asyncHandler(refreshToken));

export default router;

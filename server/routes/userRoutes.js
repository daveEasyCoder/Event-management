import express from 'express';
import { changeUserRole, getAllUsers, getUserProfile, login, logout, register, verifyOtp } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/logout', logout);
router.get('/get-users',protect, getAllUsers);
router.put('/change-role/:id',protect, changeUserRole);
router.get('/user-profile',protect, getUserProfile);

export default router;
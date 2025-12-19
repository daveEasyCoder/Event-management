import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController.js';
import {protect} from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.get('/user-orders', protect, getUserOrders);


export default router;
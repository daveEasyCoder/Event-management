import express from 'express';
import { createOrder, getUserOrders } from '../controllers/orderController.js';
import {protect} from '../middlewares/authMiddleware.js'
import { authorize } from '../middlewares/roleCheckMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.get('/my-orders', protect, authorize("user"), getUserOrders);


export default router;
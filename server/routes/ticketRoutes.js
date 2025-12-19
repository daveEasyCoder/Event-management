// routes/ticketRoutes.js
import express from 'express';
import { downloadOrderTickets, downloadTicket } from '../controllers/ticketDownloadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:ticketId/download',protect, downloadTicket);
router.get('/download-tickets/:orderId', protect, downloadOrderTickets);

export default router;
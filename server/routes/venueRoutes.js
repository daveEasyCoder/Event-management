import express from 'express';
import { createVenue, deleteVenue, getVenue, getVenueById, updateVenue } from '../controllers/venueController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'


const router = express.Router();

router.post('/create-venue', upload.single("image"), createVenue);
router.get('/get-venue', protect, getVenue);
router.get('/get-single-venue/:id', protect, getVenueById);
router.delete('/delete-venue/:id', protect, deleteVenue);
router.put('/update-venue/:id', protect, upload.single("image"), updateVenue);


export default router;
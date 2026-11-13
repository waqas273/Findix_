import express from 'express';
import { generateQrCode, resolveQrCode } from '../controllers/qrController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for finder scan resolution
router.get('/resolve/:code', resolveQrCode);

// Protected route for generating and assigning QR tags
router.post('/generate', protect, generateQrCode);

export default router;

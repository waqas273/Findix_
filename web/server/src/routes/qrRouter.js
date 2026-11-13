import express from 'express';
import { 
  resolveQrSlug, 
  claimQrSlug, 
  generateQrTag 
} from '../controllers/qrResolverController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// 1. Public endpoint for QR tag scanning & zero-leak resolution
router.get('/:qrSlug', resolveQrSlug);

// 2. Protected endpoint for claiming & registering an unassigned tag
router.post('/claim/:qrSlug', protect, uploadSingle('image'), claimQrSlug);

// 3. Protected endpoint for pre-generating tag batches
router.post('/generate', protect, generateQrTag);

export default router;

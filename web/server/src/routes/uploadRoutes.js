import express from 'express';
import { 
  uploadSingleImage, 
  uploadMultipleImages, 
  deleteImage 
} from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadSingle, uploadArray } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Require authentication for media operations
router.use(protect);

// Single image upload (defaults to 'image' form field)
router.post('/image', uploadSingle('image'), uploadSingleImage);

// Multiple image upload (up to 5 images in 'images' field)
router.post('/multiple', uploadArray('images', 5), uploadMultipleImages);

// Delete/disposal endpoint
router.delete('/image', deleteImage);

export default router;

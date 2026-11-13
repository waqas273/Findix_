import express from 'express';
import { 
  getMyItems, 
  getItemById, 
  updateItemPrivacy, 
  updateItemDetails, 
  deleteItem 
} from '../controllers/itemManagementController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Require authentication for item management operations
router.use(protect);

router.route('/')
  .get(getMyItems);

router.route('/:id')
  .get(getItemById)
  .delete(deleteItem);

// Granular configuration endpoints
router.patch('/:id/privacy', updateItemPrivacy);
router.patch('/:id/details', uploadSingle('image'), updateItemDetails);

export default router;

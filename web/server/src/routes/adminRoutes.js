import express from 'express';
import { 
  getGlobalMetrics, 
  bulkGenerateQRTags, 
  getAllTags, 
  getTagBatchesAdmin,
  deleteBatchAdmin,
  deleteTagAdmin,
  bulkDeleteTagsAdmin,
  getAllOrdersAdmin, 
  updateOrderPipelineAdmin, 
  createProductAdmin, 
  updateProductAdmin,
  deleteProductAdmin,
  getAllUsersAdmin,
  deleteUserAdmin,
  updateUserRoleAdmin
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Strict Gatekeeping: All routes require authenticated user with role === 'admin'
router.use(protect);
router.use(authorize('admin'));

// Store Products Management
router.post('/products', createProductAdmin);
router.put('/products/:id', updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);

// Users Management
router.get('/users', getAllUsersAdmin);
router.delete('/users/:id', deleteUserAdmin);
router.patch('/users/:id/role', updateUserRoleAdmin);

// Telemetry & Batch QR Lifecycle
router.get('/metrics', getGlobalMetrics);
router.post('/qr/bulk', bulkGenerateQRTags);
router.get('/qr/tags', getAllTags);
router.get('/qr/batches', getTagBatchesAdmin);
router.delete('/qr/batches/:batchId', deleteBatchAdmin);
router.delete('/qr/tags/:id', deleteTagAdmin);
router.post('/qr/tags/bulk-delete', bulkDeleteTagsAdmin);

// Order Pipeline
router.get('/orders', getAllOrdersAdmin);
router.patch('/orders/:id/status', updateOrderPipelineAdmin);

export default router;



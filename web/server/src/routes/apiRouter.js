import express from 'express';
import authRoutes from './authRoutes.js';
import itemRoutes from './itemRoutes.js';
import qrRouter from './qrRouter.js';
import uploadRoutes from './uploadRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import communityRoutes from './communityRoutes.js';
import chatRoutes from './chatRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = express.Router();

// System Health Endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'Findix',
    tagline: 'Lost, but never gone',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/items', itemRoutes);
apiRouter.use('/q', qrRouter);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/community', communityRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;

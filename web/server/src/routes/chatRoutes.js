import express from 'express';
import { 
  getConversations, 
  initiateConversation, 
  getMessages, 
  sendMessage, 
  markAsRead 
} from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.post('/conversations/init', protect, initiateConversation);
router.get('/conversations/:id/messages', protect, getMessages);
router.post('/conversations/:id/messages', protect, sendMessage);
router.post('/message', protect, sendMessage);
router.patch('/conversations/:id/read', protect, markAsRead);

export default router;

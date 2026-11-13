import express from 'express';
import { 
  getCommunityPosts, 
  createCommunityPost, 
  deleteCommunityPost,
  toggleLikePost, 
  addComment,
  deleteComment,
  toggleLikeComment
} from '../controllers/communityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getCommunityPosts);
router.post('/post', protect, createCommunityPost);
router.delete('/post/:id', protect, deleteCommunityPost);
router.post('/post/:id/like', protect, toggleLikePost);
router.post('/post/:id/comment', protect, addComment);
router.delete('/post/:postId/comment/:commentId', protect, deleteComment);
router.post('/post/:postId/comment/:commentId/like', protect, toggleLikeComment);

export default router;

import mongoose from 'mongoose';
import { CommunityPost } from '../models/CommunityPost.js';
import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get community feed posts (scoped by city or global)
 * @route   GET /api/community
 * @access  Public
 */
/**
 * @desc    Get community feed posts (scoped by city or global)
 * @route   GET /api/community
 * @access  Public
 */
export const getCommunityPosts = async (req, res) => {
  try {
    const { scope = 'city', city, tag, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState === 1) {
      let query = {};

      if (scope === 'city') {
        query.scope = 'city';
        if (city && city !== 'all') {
          query.city = new RegExp(`^${city}$`, 'i');
        }
      } else if (scope === 'global') {
        // Global feed includes all global posts + highlighted city alerts
        query.$or = [{ scope: 'global' }, { scope: 'city' }];
      }

      if (tag && tag !== 'all') {
        query.tag = tag;
      }

      if (search) {
        query.content = { $regex: search, $options: 'i' };
      }

      const total = await CommunityPost.countDocuments(query);
      const posts = await CommunityPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('authorId', 'name city avatar role')
        .populate('comments.authorId', 'name city avatar role');

      return successResponse(res, 200, 'Community posts fetched successfully', {
        posts: posts || [],
        total: total || 0,
        page: pageNum,
        pages: Math.ceil((total || 0) / limitNum) || 1,
      });
    }

    return successResponse(res, 200, 'Community posts fetched successfully', {
      posts: [],
      total: 0,
      page: pageNum,
      pages: 1,
    });
  } catch (error) {
    console.error('getCommunityPosts error:', error);
    return errorResponse(res, 500, 'Failed to fetch community posts', error.message);
  }
};

/**
 * @desc    Create new community post
 * @route   POST /api/community/post
 * @access  Private
 */
export const createCommunityPost = async (req, res) => {
  try {
    const { content, scope = 'city', city, tag = 'General Discussion', media } = req.body;
    const authorId = req.user?._id;
    const userCity = city || req.user?.city || 'Islamabad';

    if (!content || !content.trim()) {
      return errorResponse(res, 400, 'Post content cannot be empty');
    }

    const postTag = ['Lost Alert', 'Found Alert', 'General Discussion'].includes(tag)
      ? tag
      : 'General Discussion';

    if (mongoose.connection.readyState === 1) {
      const newPost = new CommunityPost({
        authorId: authorId || new mongoose.Types.ObjectId(),
        scope: scope === 'global' ? 'global' : 'city',
        city: userCity,
        tag: postTag,
        content: content.trim(),
        media: media || { url: '', public_id: '' },
        comments: [],
        likes: [],
      });

      await newPost.save();
      const populated = await CommunityPost.findById(newPost._id)
        .populate('authorId', 'name city avatar role');

      return successResponse(res, 201, 'Community post created successfully', populated);
    }

    return errorResponse(res, 503, 'Database unavailable');
  } catch (error) {
    console.error('createCommunityPost error:', error);
    return errorResponse(res, 500, 'Failed to create community post', error.message);
  }
};

/**
 * @desc    Toggle like on community post
 * @route   POST /api/community/post/:id/like
 * @access  Private
 */
export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const post = await CommunityPost.findById(id);
      if (post) {
        const isLiked = post.likes.some((uid) => String(uid) === String(userId));
        if (isLiked) {
          post.likes = post.likes.filter((uid) => String(uid) !== String(userId));
        } else {
          post.likes.push(userId);
        }
        await post.save();

        return successResponse(res, 200, isLiked ? 'Post unliked' : 'Post liked', {
          isLiked: !isLiked,
          likesCount: post.likes.length,
        });
      }
    }

    return errorResponse(res, 404, 'Post not found');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to toggle like', error.message);
  }
};

/**
 * @desc    Add comment to community post
 * @route   POST /api/community/post/:id/comment
 * @access  Private
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId, replyToUser } = req.body;

    if (!content || !content.trim()) {
      return errorResponse(res, 400, 'Comment content cannot be empty');
    }

    const commentDoc = {
      parentId: parentId && mongoose.Types.ObjectId.isValid(parentId) ? parentId : null,
      replyToUser: replyToUser ? String(replyToUser).trim() : '',
      authorId: req.user?._id || null,
      authorName: req.user?.name || 'Community Member',
      authorCity: req.user?.city || 'Pakistan',
      authorAvatar: req.user?.avatar?.url || '',
      content: content.trim(),
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const post = await CommunityPost.findById(id);
      if (post) {
        if (!Array.isArray(post.comments)) {
          post.comments = [];
        }
        post.comments.push(commentDoc);
        post.commentsCount = post.comments.length;
        await post.save();

        const savedComment = post.comments[post.comments.length - 1];

        return successResponse(res, 201, 'Comment added successfully', {
          comment: savedComment,
          commentsCount: post.commentsCount,
          postId: post._id,
        });
      }
    }

    return errorResponse(res, 404, 'Post not found');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to add comment', error.message);
  }
};

/**
 * @desc    Delete a community post (Author or Admin only)
 * @route   DELETE /api/community/post/:id
 * @access  Private
 */
export const deleteCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const isAdmin = req.user?.role === 'admin';

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const post = await CommunityPost.findById(id);
      if (!post) {
        return errorResponse(res, 404, 'Post not found');
      }

      // Only post author or admin can delete
      if (!isAdmin && String(post.authorId) !== String(userId)) {
        return errorResponse(res, 403, 'Forbidden: You can only delete your own posts');
      }

      await CommunityPost.findByIdAndDelete(id);
      return successResponse(res, 200, 'Community post deleted successfully', { postId: id });
    }

    return errorResponse(res, 404, 'Post not found');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete post', error.message);
  }
};

/**
 * @desc    Delete a reply/comment (Author or Admin only)
 * @route   DELETE /api/community/post/:postId/comment/:commentId
 * @access  Private
 */
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user?._id;
    const isAdmin = req.user?.role === 'admin';

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(postId)) {
      const post = await CommunityPost.findById(postId);
      if (!post) {
        return errorResponse(res, 404, 'Post not found');
      }

      const commentIndex = (post.comments || []).findIndex(
        (c) => String(c._id) === String(commentId)
      );

      if (commentIndex === -1) {
        return errorResponse(res, 404, 'Comment not found');
      }

      const targetComment = post.comments[commentIndex];

      // Only comment author or admin can delete
      if (!isAdmin && String(targetComment.authorId) !== String(userId)) {
        return errorResponse(res, 403, 'Forbidden: You can only delete your own replies');
      }

      // Remove the comment and its direct child replies
      post.comments = post.comments.filter(
        (c) => String(c._id) !== String(commentId) && String(c.parentId) !== String(commentId)
      );
      post.commentsCount = post.comments.length;
      await post.save();

      return successResponse(res, 200, 'Reply deleted successfully', {
        commentId,
        commentsCount: post.commentsCount,
      });
    }

    return errorResponse(res, 404, 'Post not found');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete reply', error.message);
  }
};

/**
 * @desc    Toggle like on comment/reply
 * @route   POST /api/community/post/:postId/comment/:commentId/like
 * @access  Private
 */
export const toggleLikeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(postId)) {
      const post = await CommunityPost.findById(postId);
      if (!post) {
        return errorResponse(res, 404, 'Post not found');
      }

      const targetComment = (post.comments || []).find(
        (c) => String(c._id) === String(commentId)
      );

      if (!targetComment) {
        return errorResponse(res, 404, 'Comment not found');
      }

      if (!Array.isArray(targetComment.likes)) {
        targetComment.likes = [];
      }

      const isLiked = targetComment.likes.some((uid) => String(uid) === String(userId));
      if (isLiked) {
        targetComment.likes = targetComment.likes.filter((uid) => String(uid) !== String(userId));
      } else {
        targetComment.likes.push(userId);
      }

      await post.save();

      return successResponse(res, 200, isLiked ? 'Reply unliked' : 'Reply liked', {
        commentId,
        isLiked: !isLiked,
        likesCount: targetComment.likes.length,
      });
    }

    return errorResponse(res, 404, 'Post not found');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to like reply', error.message);
  }
};

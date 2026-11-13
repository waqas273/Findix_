import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { QRItem } from '../models/QRItem.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// In-memory fallback conversation & message store for offline / mock testing
const fallbackConversations = [
  {
    _id: 'conv_demo_1',
    qrItemId: {
      _id: 'item_1',
      qrSlug: 'FDX-8821-PRO',
      itemName: 'MacBook Pro 16" Space Black',
      isLost: true,
      itemImage: {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
      },
    },
    ownerId: 'demo_owner_1',
    finderIdentifier: 'finder_session_001',
    finderUser: {
      _id: 'finder_user_1',
      name: 'Farhan Ali (Finder)',
      phone: '+92 301 5554321',
      city: 'Karachi',
    },
    lastMessage: {
      content: 'I have your MacBook safe with me at Dolmen Mall security desk.',
      senderRole: 'finder',
      timestamp: new Date(Date.now() - 3600000 * 1),
    },
    unreadCountOwner: 1,
    unreadCountFinder: 0,
    updatedAt: new Date(Date.now() - 3600000 * 1),
  },
];

const fallbackMessages = [
  {
    _id: 'msg_1',
    conversationId: 'conv_demo_1',
    senderRole: 'finder',
    content: 'Hi! I scanned the Findix tag on your MacBook Pro in the food court.',
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 2),
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: 'msg_2',
    conversationId: 'conv_demo_1',
    senderRole: 'owner',
    content: 'Oh thank goodness! I realized I left it 20 minutes ago. Where are you right now?',
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 1.5),
    createdAt: new Date(Date.now() - 3600000 * 1.5),
  },
  {
    _id: 'msg_3',
    conversationId: 'conv_demo_1',
    senderRole: 'finder',
    content: '📍 Shared Location: Dolmen Mall Clifton, Ground Floor Customer Helpdesk.',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 3600000 * 1),
  },
];

/**
 * @desc    Get user's conversations (as owner or finder)
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1 && userId) {
      let convs = await Conversation.find({
        $or: [{ ownerId: userId }, { finderUser: userId }],
      })
        .sort({ updatedAt: -1 })
        .populate('qrItemId', 'itemName qrSlug isLost itemImage returnRewardNote')
        .populate('finderUser', 'name email phone avatar')
        .populate('ownerId', 'name email phone avatar');

      // If user has no conversations yet, auto-seed a persistent welcome thread for their QR items if any exist
      if ((!convs || convs.length === 0)) {
        const userItem = await QRItem.findOne({ ownerId: userId });
        if (userItem) {
          const seededConv = new Conversation({
            qrItemId: userItem._id,
            ownerId: userId,
            finderIdentifier: `system_relay_${userId}`,
            lastMessage: {
              content: `Findix Zero-Leak Relay channel activated for ${userItem.itemName}. Scans and finder messages will appear here.`,
              senderRole: 'finder',
              timestamp: new Date(),
            },
            unreadCountOwner: 0,
            unreadCountFinder: 0,
          });
          await seededConv.save();

          const seededMsg = new Message({
            conversationId: seededConv._id,
            senderRole: 'finder',
            content: `Findix Zero-Leak Relay channel activated for ${userItem.itemName}. Scans and finder messages will appear here.`,
            isRead: true,
          });
          await seededMsg.save();

          convs = await Conversation.find({ _id: seededConv._id })
            .populate('qrItemId', 'itemName qrSlug isLost itemImage returnRewardNote')
            .populate('finderUser', 'name email phone avatar')
            .populate('ownerId', 'name email phone avatar');
        }
      }

      if (convs && convs.length > 0) {
        return successResponse(res, 200, 'Conversations retrieved successfully', convs);
      }
    }

    return successResponse(res, 200, 'Conversations retrieved successfully', []);
  } catch (error) {
    console.error('getConversations error:', error);
    return errorResponse(res, 500, 'Failed to fetch conversations', error.message);
  }
};

/**
 * @desc    Initiate or retrieve conversation for a scanned item (Finder -> Owner)
 * @route   POST /api/chat/conversations/init
 * @access  Private / Authenticated Finder
 */
export const initiateConversation = async (req, res) => {
  try {
    const { qrSlug, initialMessage } = req.body;
    const finderId = req.user?._id;

    if (!qrSlug) {
      return errorResponse(res, 400, 'QR Slug is required to initiate conversation');
    }

    if (mongoose.connection.readyState === 1) {
      const item = await QRItem.findOne({ qrSlug });
      if (!item) {
        return errorResponse(res, 404, 'Tag item not found');
      }

      if (!item.ownerId) {
        return errorResponse(res, 400, 'This tag has not been claimed by an owner yet');
      }

      const finderIdentifier = finderId ? String(finderId) : `session_${req.ip || 'finder'}`;

      // Check if conversation already exists
      let conv = await Conversation.findOne({
        qrItemId: item._id,
        $or: [{ finderIdentifier }, { finderUser: finderId }],
      }).populate('qrItemId', 'itemName qrSlug isLost itemImage returnRewardNote');

      if (!conv) {
        conv = new Conversation({
          qrItemId: item._id,
          ownerId: item.ownerId,
          finderIdentifier,
          finderUser: finderId || null,
          lastMessage: {
            content: initialMessage || 'Finder initiated contact regarding this item',
            senderRole: 'finder',
            timestamp: new Date(),
          },
          unreadCountOwner: 1,
        });
        await conv.save();

        if (initialMessage) {
          const firstMsg = new Message({
            conversationId: conv._id,
            senderRole: 'finder',
            senderId: finderId || null,
            content: initialMessage,
          });
          await firstMsg.save();
        }

        conv = await Conversation.findById(conv._id)
          .populate('qrItemId', 'itemName qrSlug isLost itemImage returnRewardNote')
          .populate('ownerId', 'name email avatar');
      }

      return successResponse(res, 200, 'Conversation initialized', conv);
    }

    return errorResponse(res, 503, 'Database unavailable');
  } catch (error) {
    console.error('initiateConversation error:', error);
    return errorResponse(res, 500, 'Failed to initiate conversation', error.message);
  }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/chat/conversations/:id/messages
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });

      // Mark incoming messages as read
      await Message.updateMany(
        { conversationId: id, senderId: { $ne: userId }, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      // Return with normalized text property
      const formatted = messages.map((m) => ({
        ...m.toObject(),
        text: m.content,
      }));

      return successResponse(res, 200, 'Messages retrieved', formatted);
    }

    return successResponse(res, 200, 'Messages retrieved', []);
  } catch (error) {
    return errorResponse(res, 500, 'Error retrieving messages', error.message);
  }
};

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/chat/message OR POST /api/chat/conversations/:id/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.id || req.body.conversationId;
    const content = req.body.content || req.body.text || '';
    const media = req.body.media || { url: '', public_id: '' };
    const userId = req.user?._id;

    if (!conversationId || !content || !content.trim()) {
      return errorResponse(res, 400, 'Conversation ID and message content are required');
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(conversationId)) {
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        return errorResponse(res, 404, 'Conversation not found');
      }

      // Determine sender role
      const isOwner = String(conv.ownerId) === String(userId);
      const senderRole = isOwner ? 'owner' : 'finder';

      const newMsg = new Message({
        conversationId,
        senderRole,
        senderId: userId || null,
        content: content.trim(),
        media: media,
        isRead: false,
      });

      await newMsg.save();

      // Update conversation last message & unread counters
      conv.lastMessage = {
        content: content.trim(),
        senderRole,
        timestamp: new Date(),
      };
      if (isOwner) {
        conv.unreadCountFinder += 1;
      } else {
        conv.unreadCountOwner += 1;
      }
      conv.updatedAt = new Date();
      await conv.save();

      const result = {
        ...newMsg.toObject(),
        text: newMsg.content,
      };

      return successResponse(res, 201, 'Message sent successfully', result);
    }

    return errorResponse(res, 400, 'Invalid conversation identifier');
  } catch (error) {
    console.error('sendMessage error:', error);
    return errorResponse(res, 500, 'Failed to send message', error.message);
  }
};

/**
 * @desc    Mark conversation as read
 * @route   PATCH /api/chat/conversations/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await Message.updateMany(
        { conversationId: id, senderId: { $ne: userId }, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      const conv = await Conversation.findById(id);
      if (conv) {
        if (String(conv.ownerId) === String(userId)) {
          conv.unreadCountOwner = 0;
        } else {
          conv.unreadCountFinder = 0;
        }
        await conv.save();
      }
    }

    return successResponse(res, 200, 'Conversation marked as read');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to mark conversation as read', error.message);
  }
};

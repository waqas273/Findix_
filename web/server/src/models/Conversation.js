import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    qrItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRItem',
      required: [true, 'Conversation must be attached to a QR item'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    finderIdentifier: {
      type: String,
      required: [true, 'Finder session/contact identifier is required'],
      trim: true,
      index: true,
    },
    finderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    lastMessage: {
      content: {
        type: String,
        default: '',
      },
      senderRole: {
        type: String,
        enum: ['owner', 'finder'],
        default: 'finder',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
    unreadCountOwner: {
      type: Number,
      default: 0,
      min: 0,
    },
    unreadCountFinder: {
      type: Number,
      default: 0,
      min: 0,
    },
    isClosed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate conversation channels between same finder identifier and item
conversationSchema.index({ qrItemId: 1, finderIdentifier: 1 }, { unique: true });
conversationSchema.index({ ownerId: 1, updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);

import mongoose from 'mongoose';
import { generateQrSlug } from '../utils/slugGenerator.js';

const qrItemSchema = new mongoose.Schema(
  {
    qrSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['unclaimed', 'claimed', 'inactive'],
        message: '{VALUE} is not a valid QR status',
      },
      default: 'unclaimed',
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    itemName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    itemImage: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
    isLost: {
      type: Boolean,
      default: false,
      index: true,
    },
    returnRewardNote: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Reward note cannot exceed 300 characters'],
    },
    privacySettings: {
      showName: {
        type: Boolean,
        default: true,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      showWhatsApp: {
        type: Boolean,
        default: true,
      },
      allowInAppChat: {
        type: Boolean,
        default: true,
      },
    },
    customContact: {
      phone: {
        type: String,
        trim: true,
        default: '',
      },
      whatsApp: {
        type: String,
        trim: true,
        default: '',
      },
    },
    productType: {
      type: String,
      enum: ['keychain', 'sticker', 'general'],
      default: 'keychain',
      index: true,
    },
    batchId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    manufactureNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexing for fast retrieval of user active/lost items
qrItemSchema.index({ ownerId: 1, status: 1 });
qrItemSchema.index({ isLost: 1, createdAt: -1 });

// Pre-validate hook: auto-assign slug if not present
qrItemSchema.pre('validate', function (next) {
  if (!this.qrSlug) {
    this.qrSlug = generateQrSlug();
  }
  next();
});

export const QRItem = mongoose.model('QRItem', qrItemSchema);

import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: false,
    },
    qrImageUrl: {
      type: String,
      default: '',
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const QrCode = mongoose.model('QrCode', qrCodeSchema);

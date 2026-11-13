import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please specify the item name/title'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['electronics', 'keys', 'wallet', 'luggage', 'pet', 'documents', 'vehicle', 'other'],
      default: 'other',
    },
    description: {
      type: String,
      default: '',
    },
    rewardAmount: {
      type: Number,
      default: 0,
    },
    rewardCurrency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['safe', 'lost', 'found', 'recovered'],
      default: 'safe',
    },
    image: {
      type: String,
      default: '',
    },
    emergencyContact: {
      type: String,
      default: '',
    },
    qrCodeId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Item = mongoose.model('Item', itemSchema);

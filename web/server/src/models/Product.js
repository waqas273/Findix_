import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide product title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please specify the price in PKR or standard currency'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Please choose a category'],
      enum: {
        values: ['keychain', 'sticker', 'pet_tag'],
        message: '{VALUE} is not a supported product category',
      },
      index: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-frequency sorting & filtering indexes
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Unit snapshot price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const trackingHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a buyer'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: 'An order must contain at least one item',
      },
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Shipping street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Shipping city is required'],
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
        default: '',
      },
      phone: {
        type: String,
        required: [true, 'Shipping phone contact is required'],
        trim: true,
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    pipelineStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        message: '{VALUE} is not a valid order pipeline status',
      },
      default: 'Pending',
      index: true,
    },
    trackingHistory: {
      type: [trackingHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// High-frequency order query indexes
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ pipelineStatus: 1, createdAt: -1 });
orderSchema.index({ 'shippingAddress.city': 1 });

// Pre-save hook: auto-sync trackingHistory timeline on status change or creation
orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('pipelineStatus')) {
    this.trackingHistory.push({
      status: this.pipelineStatus,
      updatedAt: new Date(),
      note: this.isNew
        ? 'Order placed and initialized'
        : `Order status transitioned to ${this.pipelineStatus}`,
    });
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);

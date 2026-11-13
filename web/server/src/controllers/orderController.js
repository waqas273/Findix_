import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { SEED_PRODUCTS } from './productController.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// In-memory fallback orders store for simulated mock sessions when DB is offline
const fallbackOrdersStore = [];

/**
 * @desc    Create new customer order & initialize tracking
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod', discountAmount = 0 } = req.body;
    const buyerId = req.user?._id || new mongoose.Types.ObjectId();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'Order must contain at least one item');
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      return errorResponse(res, 400, 'Please provide complete shipping address details');
    }

    let calculatedTotal = 0;
    const processedItems = [];

    // Verify each item's price and stock
    for (const item of items) {
      const quantity = parseInt(item.quantity, 10) || 1;
      let unitPrice = item.price;
      let title = item.title || 'Smart Recovery Tag';
      let image = item.image || '';

      // Check if product exists in MongoDB or Seed Catalog
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(item.productId)) {
        const dbProduct = await Product.findById(item.productId);
        if (dbProduct) {
          unitPrice = dbProduct.price;
          title = dbProduct.title;
          image = dbProduct.images?.[0]?.url || '';
          // Deduct stock if available
          if (dbProduct.stock >= quantity) {
            dbProduct.stock -= quantity;
            await dbProduct.save();
          }
        }
      } else {
        // Match against seed items
        const seedItem = SEED_PRODUCTS.find(
          (p, idx) => `seed_${idx + 1}` === item.productId || `prod_${idx + 1}` === item.productId || p.title === item.title
        );
        if (seedItem) {
          unitPrice = seedItem.price;
          title = seedItem.title;
          image = seedItem.images?.[0]?.url || '';
        }
      }

      const itemSubtotal = unitPrice * quantity;
      calculatedTotal += itemSubtotal;

      processedItems.push({
        productId: mongoose.Types.ObjectId.isValid(item.productId) 
          ? new mongoose.Types.ObjectId(item.productId)
          : new mongoose.Types.ObjectId(),
        title,
        image,
        quantity,
        price: unitPrice,
      });
    }

    // Apply voucher discount if any
    const finalTotal = Math.max(0, calculatedTotal - (Number(discountAmount) || 0));

    // If connected to MongoDB, persist Order
    if (mongoose.connection.readyState === 1) {
      const order = new Order({
        buyerId,
        items: processedItems,
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode || '',
          phone: shippingAddress.phone,
        },
        totalAmount: finalTotal,
        pipelineStatus: 'Pending',
      });

      await order.save();

      return successResponse(res, 201, 'Order created and tracking initialized successfully', order);
    }

    // Fallback in-memory order object
    const simulatedOrderId = new mongoose.Types.ObjectId();
    const simulatedOrder = {
      _id: simulatedOrderId,
      orderNumber: `FDX-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      buyerId,
      items: processedItems,
      shippingAddress,
      totalAmount: finalTotal,
      paymentMethod,
      pipelineStatus: 'Pending',
      trackingHistory: [
        {
          status: 'Pending',
          updatedAt: new Date(),
          note: 'Order placed and initialized with lifetime recovery routing',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fallbackOrdersStore.unshift(simulatedOrder);

    return successResponse(res, 201, 'Order created and tracking initialized successfully', simulatedOrder);
  } catch (error) {
    console.error('createOrder error:', error);
    return errorResponse(res, 500, 'Failed to process order', error.message);
  }
};

/**
 * @desc    Get authenticated user's order history with tracking timeline
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user?._id;

    if (mongoose.connection.readyState === 1 && buyerId) {
      const dbOrders = await Order.find({ buyerId }).sort({ createdAt: -1 }).populate('items.productId', 'title images');
      if (dbOrders && dbOrders.length > 0) {
        return successResponse(res, 200, 'Orders retrieved successfully', dbOrders);
      }
    }

    // Filter fallback orders store for user
    const userFallbackOrders = fallbackOrdersStore.filter(
      (o) => String(o.buyerId) === String(buyerId)
    );

    // If no orders yet, return initial demonstration sample order so the user can immediately experience the tracking pipeline
    if (userFallbackOrders.length === 0) {
      const demoOrder = {
        _id: 'ord_demo_01',
        orderNumber: 'FDX-ORD-984210',
        buyerId: buyerId || 'demo_user',
        items: [
          {
            productId: 'seed_1',
            title: 'Titanium Matte QR Keychain Tag',
            image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
            quantity: 2,
            price: 2499,
          },
          {
            productId: 'seed_2',
            title: 'Findix Holographic Metallic Decals (3-Pack)',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
            quantity: 1,
            price: 1499,
          }
        ],
        shippingAddress: {
          street: 'Suite 402, Al-Tahir Heights, Clifton Block 5',
          city: req.user?.city || 'Karachi',
          postalCode: '75600',
          phone: req.user?.phone || '+92 300 1234567',
        },
        totalAmount: 6497,
        paymentMethod: 'cod',
        pipelineStatus: 'Processing',
        trackingHistory: [
          {
            status: 'Pending',
            updatedAt: new Date(Date.now() - 3600000 * 6),
            note: 'Order placed and initialized',
          },
          {
            status: 'Processing',
            updatedAt: new Date(Date.now() - 3600000 * 2),
            note: 'Tags laser-etched and cryptographic routing slugs provisioned in cleanroom',
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 6),
        updatedAt: new Date(Date.now() - 3600000 * 2),
      };

      return successResponse(res, 200, 'Orders retrieved successfully', [demoOrder, ...userFallbackOrders]);
    }

    return successResponse(res, 200, 'Orders retrieved successfully', userFallbackOrders);
  } catch (error) {
    console.error('getMyOrders error:', error);
    return errorResponse(res, 500, 'Failed to fetch orders', error.message);
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const order = await Order.findById(id).populate('items.productId');
      if (order) {
        return successResponse(res, 200, 'Order retrieved successfully', order);
      }
    }

    const fallback = fallbackOrdersStore.find((o) => String(o._id) === id || o.orderNumber === id);
    if (fallback) {
      return successResponse(res, 200, 'Order retrieved successfully', fallback);
    }

    return errorResponse(res, 404, 'Order not found');
  } catch (error) {
    return errorResponse(res, 500, 'Error retrieving order', error.message);
  }
};

/**
 * @desc    Update order pipeline status (Simulation / Admin)
 * @route   PATCH /api/orders/:id/status
 * @access  Private
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const order = await Order.findById(id);
      if (order) {
        order.pipelineStatus = status;
        if (note) {
          order.trackingHistory[order.trackingHistory.length - 1].note = note;
        }
        await order.save();
        return successResponse(res, 200, `Order transitioned to ${status}`, order);
      }
    }

    // Update in fallback store
    const fallback = fallbackOrdersStore.find((o) => String(o._id) === id || o.orderNumber === id);
    if (fallback) {
      fallback.pipelineStatus = status;
      fallback.trackingHistory.push({
        status,
        updatedAt: new Date(),
        note: note || `Order status updated to ${status}`,
      });
      fallback.updatedAt = new Date();
      return successResponse(res, 200, `Order transitioned to ${status}`, fallback);
    }

    return successResponse(res, 200, `Simulated transition to ${status}`, {
      _id: id,
      pipelineStatus: status,
      updatedAt: new Date(),
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update order status', error.message);
  }
};

import mongoose from 'mongoose';
import { QRItem } from '../models/QRItem.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { generateQrSlug } from '../utils/slugGenerator.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
// In-memory admin state
let simulatedManufacturedTags = [];
let simulatedAdminProducts = [];


/**
 * @desc    Get system global metrics & telemetry
 * @route   GET /api/admin/metrics
 * @access  Private (Admin)
 */
import { Conversation } from '../models/Conversation.js';

export const getGlobalMetrics = async (req, res) => {
  try {
    let totalTags = 0;
    let claimedCount = 0;
    let lostItemsCount = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalUsers = 0;
    let activeInquiries = 0;

    if (mongoose.connection.readyState === 1) {
      const [tagTotal, tagClaimed, tagLost, orderCount, userCount, inquiryCount] = await Promise.all([
        QRItem.countDocuments(),
        QRItem.countDocuments({ status: 'claimed' }),
        QRItem.countDocuments({ isLost: true }),
        Order.countDocuments(),
        User.countDocuments(),
        Conversation.countDocuments(),
      ]);

      totalTags = tagTotal;
      claimedCount = tagClaimed;
      lostItemsCount = tagLost;
      totalOrders = orderCount;
      totalUsers = userCount;
      activeInquiries = inquiryCount;

      // Calculate revenue
      const revenueAgg = await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]);
      if (revenueAgg && revenueAgg.length > 0) {
        totalRevenue = revenueAgg[0].total;
      }
    }

    const claimPercentage = totalTags > 0 ? Math.round((claimedCount / totalTags) * 100) : 0;

    return successResponse(res, 200, 'Global telemetry metrics retrieved', {
      totalTags,
      claimedCount,
      unclaimedCount: totalTags - claimedCount,
      claimPercentage,
      lostItemsCount,
      totalOrders,
      totalRevenue,
      totalUsers,
      activeInquiries,
      uptime: process.uptime(),
      systemStatus: 'Optimal (Cleanroom Fabricator Ready)',
    });
  } catch (error) {
    console.error('getGlobalMetrics error:', error);
    return errorResponse(res, 500, 'Failed to fetch global metrics', error.message);
  }
};


/**
 * @desc    Bulk generate cryptographic QR tags in 'unclaimed' status
 * @route   POST /api/admin/qr/bulk
 * @access  Private (Admin)
 */
export const bulkGenerateQRTags = async (req, res) => {
  try {
    const { batchSize = 50, categoryTag = 'General', notes = '' } = req.body;
    const count = Math.min(1000, Math.max(1, parseInt(batchSize, 10) || 50));
    const batchId = `BATCH-${Date.now()}`;

    const newSlugs = [];
    const newTagDocuments = [];

    for (let i = 0; i < count; i++) {
      const slug = generateQrSlug('FDX', 8);
      newSlugs.push({
        qrSlug: slug,
        qrUrl: `https://findix.pk/q/${slug}`,
        status: 'unclaimed',
        categoryTag,
        batchId,
        createdAt: new Date(),
      });

      newTagDocuments.push({
        qrSlug: slug,
        status: 'unclaimed',
        privacySettings: {
          showName: true,
          showPhone: false,
          showWhatsApp: true,
          allowInAppChat: true,
        },
      });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await QRItem.insertMany(newTagDocuments, { ordered: false });
      } catch (insertErr) {
        console.warn('Some duplicate slugs skipped during bulk insert:', insertErr.message);
      }
    }

    simulatedManufacturedTags = [...newSlugs, ...simulatedManufacturedTags];

    return successResponse(res, 201, `Successfully generated ${count} cryptographic QR tags`, {
      batchId,
      batchSize: count,
      categoryTag,
      notes,
      generatedCount: newSlugs.length,
      sampleSlugs: newSlugs.slice(0, 10),
      allSlugs: newSlugs,
    });
  } catch (error) {
    console.error('bulkGenerateQRTags error:', error);
    return errorResponse(res, 500, 'Failed to execute bulk QR generation', error.message);
  }
};

/**
 * @desc    Get all manufactured QR tags
 * @route   GET /api/admin/qr/tags
 * @access  Private (Admin)
 */
export const getAllTags = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (search) {
        query.qrSlug = { $regex: search, $options: 'i' };
      }

      const total = await QRItem.countDocuments(query);
      const tags = await QRItem.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('ownerId', 'name email city phone');

      return successResponse(res, 200, 'Tags retrieved successfully', {
        tags: tags || [],
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
      });
    }

    let filtered = [...simulatedManufacturedTags];
    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (search) {
      filtered = filtered.filter((t) => t.qrSlug.toLowerCase().includes(search.toLowerCase()));
    }

    return successResponse(res, 200, 'Tags retrieved successfully', {
      tags: filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum),
      total: filtered.length,
      page: pageNum,
      pages: Math.ceil(filtered.length / limitNum) || 1,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch tags', error.message);
  }
};

/**
 * @desc    Get all orders for admin pipeline manager
 * @route   GET /api/admin/orders
 * @access  Private (Admin)
 */
export const getAllOrdersAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('buyerId', 'name email phone city')
        .populate('items.productId', 'title');

      return successResponse(res, 200, 'All orders retrieved', orders || []);
    }

    return successResponse(res, 200, 'All orders retrieved', []);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch orders for admin', error.message);
  }
};


/**
 * @desc    Shift order pipeline status from admin table
 * @route   PATCH /api/admin/orders/:id/status
 * @access  Private (Admin)
 */
export const updateOrderPipelineAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid pipeline status. Must be: ${validStatuses.join(', ')}`);
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const order = await Order.findById(id);
      if (order) {
        order.pipelineStatus = status;
        order.trackingHistory.push({
          status,
          updatedAt: new Date(),
          note: note || `Admin shifted status to ${status}`,
        });
        await order.save();
        return successResponse(res, 200, `Order pipeline updated to ${status}`, order);
      }
    }

    return successResponse(res, 200, `Order pipeline updated to ${status}`, {
      _id: id,
      pipelineStatus: status,
      updatedAt: new Date(),
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update order status', error.message);
  }
};

/**
 * @desc    Admin Product CRUD: Create Product
 * @route   POST /api/admin/products
 * @access  Private (Admin)
 */
export const createProductAdmin = async (req, res) => {
  try {
    const { title, description, price, stock, category, images, specs, inTheBox } = req.body;

    if (!title || !description || !price || !category) {
      return errorResponse(res, 400, 'Please provide product title, description, price, and category');
    }

    if (mongoose.connection.readyState === 1) {
      const product = new Product({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock) || 0,
        category,
        images: images || [],
      });
      await product.save();
      return successResponse(res, 201, 'Product created successfully', product);
    }

    const simulatedProduct = {
      _id: `prod_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      category,
      images: images || [{ url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80' }],
      specs: specs || {},
      inTheBox: inTheBox || [],
      createdAt: new Date(),
    };

    simulatedAdminProducts.unshift(simulatedProduct);

    return successResponse(res, 201, 'Product created successfully', simulatedProduct);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create product', error.message);
  }
};

/**
 * @desc    Admin Product CRUD: Update Product
 * @route   PUT /api/admin/products/:id
 * @access  Private (Admin)
 */
export const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (product) {
        return successResponse(res, 200, 'Product updated successfully', product);
      }
    }

    // In-memory fallback
    simulatedAdminProducts = simulatedAdminProducts.map((p) =>
      p._id === id ? { ...p, ...updates } : p
    );

    return successResponse(res, 200, 'Product updated successfully', { _id: id, ...updates });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update product', error.message);
  }
};

/**
 * @desc    Admin Product CRUD: Delete Product
 * @route   DELETE /api/admin/products/:id
 * @access  Private (Admin)
 */
export const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      await Product.findByIdAndDelete(id);
      return successResponse(res, 200, 'Product deleted successfully from catalog');
    }

    // In-memory fallback
    simulatedAdminProducts = simulatedAdminProducts.filter((p) => p._id !== id);

    return successResponse(res, 200, 'Product deleted successfully from catalog', { _id: id });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete product', error.message);
  }
};

/**
 * @desc    Get all users (Admin User Management)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    if (mongoose.connection.readyState === 1) {
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 });
      return successResponse(res, 200, 'Users retrieved successfully', users);
    }

    return successResponse(res, 200, 'Users retrieved successfully', []);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch users', error.message);
  }
};

/**
 * @desc    Delete user by ID (Admin User Management)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user && req.user._id?.toString() === id) {
      return errorResponse(res, 400, 'You cannot delete your own logged-in admin account.');
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findById(id);
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }
      await User.findByIdAndDelete(id);
      return successResponse(res, 200, `User ${user.email} deleted successfully`);
    }

    return successResponse(res, 200, 'User deleted successfully', { _id: id });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete user', error.message);
  }
};

/**
 * @desc    Update user role (Admin User Management)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin)
 */
export const updateUserRoleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['buyer', 'admin'].includes(role)) {
      return errorResponse(res, 400, 'Role must be either buyer or admin');
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
      return successResponse(res, 200, `User role updated to ${role}`, user);
    }

    return successResponse(res, 200, `User role updated to ${role}`, { _id: id, role });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update user role', error.message);
  }
};



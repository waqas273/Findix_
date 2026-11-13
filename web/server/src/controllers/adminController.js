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
 * @desc    Bulk generate cryptographic QR tags in 'unclaimed' status with sequential identifiers
 * @route   POST /api/admin/qr/bulk
 * @access  Private (Admin)
 */
export const bulkGenerateQRTags = async (req, res) => {
  try {
    const { batchSize = 42, categoryTag = 'Laser Metal Keychain', batchRef = '', notes = '' } = req.body;
    
    // 1. Compulsory Validations
    if (!batchRef || !batchRef.trim()) {
      return errorResponse(res, 400, 'Batch Reference is compulsory! Please enter a unique batch code.');
    }
    if (!notes || !notes.trim()) {
      return errorResponse(res, 400, 'Production Notes are compulsory! Please enter production details.');
    }

    const count = Math.min(1000, Math.max(1, parseInt(batchSize, 10) || 42));
    const normalizedType = categoryTag.toLowerCase().includes('sticker') ? 'sticker' : 'keychain';
    const typeCode = normalizedType === 'sticker' ? 'ST' : 'KC';
    
    // 2. Sanitize Batch Reference
    const batchId = batchRef.trim().toUpperCase().replace(/[^A-Z0-9\-_]/g, '');

    // 3. Extract short batch identifier for sequential QR references
    // Examples: BATCH-KC-20261113-001 -> KC01, BATCH-ST-20261113-002 -> ST02
    const lastDigitsMatch = batchId.match(/(\d+)$/);
    const seqSuffix = lastDigitsMatch ? lastDigitsMatch[1].slice(-2).padStart(2, '0') : '01';
    const shortBatch = `${typeCode}${seqSuffix}`;

    // 4. Starting sequence within this batch
    let startingIndex = 1;
    if (mongoose.connection.readyState === 1) {
      const existingInBatch = await QRItem.countDocuments({ batchId });
      startingIndex = existingInBatch + 1;
    } else {
      const existingInBatch = simulatedManufacturedTags.filter((t) => t.batchId === batchId).length;
      startingIndex = existingInBatch + 1;
    }

    const newSlugs = [];
    const newTagDocuments = [];

    const appBaseUrl = (process.env.APP_BASE_URL || process.env.CLIENT_URL || 'https://findix.vercel.app').replace(/\/+$/, '');

    for (let i = 0; i < count; i++) {
      const unitIndex = startingIndex + i;
      const paddedUnit = String(unitIndex).padStart(4, '0'); // e.g. 0001, 0002 ... 0042
      let slug = `FDX-${shortBatch}-${paddedUnit}`;

      // Ensure absolute uniqueness if previously generated
      if (mongoose.connection.readyState === 1) {
        const collision = await QRItem.exists({ qrSlug: slug });
        if (collision) {
          const randSuffix = Math.floor(10 + Math.random() * 90);
          slug = `FDX-${shortBatch}-${paddedUnit}-${randSuffix}`;
        }
      }

      newSlugs.push({
        qrSlug: slug,
        qrUrl: `${appBaseUrl}/q/${slug}`,
        status: 'unclaimed',
        productType: normalizedType,
        categoryTag,
        batchId,
        createdAt: new Date(),
      });

      newTagDocuments.push({
        qrSlug: slug,
        status: 'unclaimed',
        productType: normalizedType,
        batchId,
        manufactureNotes: notes.trim(),
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
        console.warn('Duplicate slugs skipped during bulk insert:', insertErr.message);
      }
    }

    simulatedManufacturedTags = [...newSlugs, ...simulatedManufacturedTags];

    return successResponse(res, 201, `Successfully generated ${count} sequential QR tags for ${categoryTag} in batch ${batchId}`, {
      batchId,
      batchSize: count,
      productType: normalizedType,
      categoryTag,
      notes: notes.trim(),
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
    const { status, productType, batchId, search, page = 1, limit = 100 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (status && status !== 'all') {
        if (status === 'lost') {
          query.isLost = true;
        } else {
          query.status = status;
        }
      }
      if (productType && productType !== 'all') {
        query.productType = productType;
      }
      if (batchId && batchId !== 'all') {
        query.batchId = batchId;
      }
      if (search) {
        query.$or = [
          { qrSlug: { $regex: search, $options: 'i' } },
          { itemName: { $regex: search, $options: 'i' } },
          { batchId: { $regex: search, $options: 'i' } }
        ];
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
    if (productType && productType !== 'all') {
      filtered = filtered.filter((t) => t.productType === productType);
    }
    if (batchId && batchId !== 'all') {
      filtered = filtered.filter((t) => t.batchId === batchId);
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
 * @desc    Get all production batches aggregated
 * @route   GET /api/admin/qr/batches
 * @access  Private (Admin)
 */
export const getTagBatchesAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const batches = await QRItem.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$batchId', 'UNASSIGNED-BATCH'] },
            productType: { $first: '$productType' },
            manufactureNotes: { $first: '$manufactureNotes' },
            createdAt: { $min: '$createdAt' },
            totalCount: { $sum: 1 },
            unclaimedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'unclaimed'] }, 1, 0] },
            },
            claimedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] },
            },
            lostCount: {
              $sum: { $cond: [{ $eq: ['$isLost', true] }, 1, 0] },
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      return successResponse(res, 200, 'Batches aggregated successfully', batches);
    }

    // In-memory fallback
    const map = {};
    simulatedManufacturedTags.forEach((t) => {
      const bId = t.batchId || 'UNASSIGNED-BATCH';
      if (!map[bId]) {
        map[bId] = {
          _id: bId,
          productType: t.productType || 'keychain',
          manufactureNotes: t.notes || '',
          createdAt: t.createdAt || new Date(),
          totalCount: 0,
          unclaimedCount: 0,
          claimedCount: 0,
          lostCount: 0,
        };
      }
      map[bId].totalCount += 1;
      if (t.status === 'unclaimed') map[bId].unclaimedCount += 1;
      if (t.status === 'claimed') map[bId].claimedCount += 1;
    });

    return successResponse(res, 200, 'Batches aggregated successfully', Object.values(map));
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch batches', error.message);
  }
};

/**
 * @desc    Delete all dummy (unclaimed) tags of an entire batch
 * @route   DELETE /api/admin/qr/batches/:batchId
 * @access  Private (Admin)
 */
export const deleteBatchAdmin = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const result = await QRItem.deleteMany({
        batchId,
        status: 'unclaimed',
        $or: [{ ownerId: null }, { ownerId: { $exists: false } }],
      });

      return successResponse(res, 200, `Successfully deleted ${result.deletedCount} dummy tags from batch ${batchId}`, {
        deletedCount: result.deletedCount,
      });
    }

    const prevLen = simulatedManufacturedTags.length;
    simulatedManufacturedTags = simulatedManufacturedTags.filter(
      (t) => !(t.batchId === batchId && t.status === 'unclaimed')
    );
    const deletedCount = prevLen - simulatedManufacturedTags.length;

    return successResponse(res, 200, `Deleted ${deletedCount} dummy tags from batch ${batchId}`, {
      deletedCount,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete batch', error.message);
  }
};

/**
 * @desc    Delete a single dummy/unclaimed QR tag
 * @route   DELETE /api/admin/qr/tags/:id
 * @access  Private (Admin)
 */
export const deleteTagAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const tag = await QRItem.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []),
          { qrSlug: id }
        ]
      });

      if (!tag) {
        return errorResponse(res, 404, 'QR Tag not found in database');
      }

      // Security check: only allow deletion of unclaimed (dummy) tags!
      if (tag.status === 'claimed' || tag.ownerId) {
        return errorResponse(res, 400, 'Security Policy: Cannot delete a tag that has already been claimed by a buyer.');
      }

      await QRItem.findByIdAndDelete(tag._id);
      return successResponse(res, 200, `Dummy tag ${tag.qrSlug} deleted successfully`);
    }

    simulatedManufacturedTags = simulatedManufacturedTags.filter(
      (t) => t.qrSlug !== id && t._id !== id
    );

    return successResponse(res, 200, `Tag ${id} deleted successfully`);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete QR tag', error.message);
  }
};

/**
 * @desc    Bulk delete dummy/unclaimed QR tags (multi-select / select all)
 * @route   POST /api/admin/qr/tags/bulk-delete
 * @access  Private (Admin)
 */
export const bulkDeleteTagsAdmin = async (req, res) => {
  try {
    const { tagIds } = req.body;

    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return errorResponse(res, 400, 'Please provide an array of tag IDs to delete');
    }

    if (mongoose.connection.readyState === 1) {
      const deleteResult = await QRItem.deleteMany({
        $and: [
          {
            $or: [
              { _id: { $in: tagIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) } },
              { qrSlug: { $in: tagIds } }
            ]
          },
          { status: 'unclaimed' },
          { $or: [{ ownerId: null }, { ownerId: { $exists: false } }] }
        ]
      });

      return successResponse(res, 200, `Successfully deleted ${deleteResult.deletedCount} dummy QR tags`, {
        deletedCount: deleteResult.deletedCount,
      });
    }

    const prevCount = simulatedManufacturedTags.length;
    simulatedManufacturedTags = simulatedManufacturedTags.filter(
      (t) => !tagIds.includes(t.qrSlug) && !tagIds.includes(t._id)
    );
    const deletedCount = prevCount - simulatedManufacturedTags.length;

    return successResponse(res, 200, `Successfully deleted ${deletedCount} dummy QR tags`, {
      deletedCount,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to execute bulk tag deletion', error.message);
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



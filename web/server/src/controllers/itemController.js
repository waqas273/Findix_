import { Item } from '../models/Item.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all items for logged in user
// @route   GET /api/items
// @access  Private
export const getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Items retrieved successfully', { items });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Create a new recovery item
// @route   POST /api/items
// @access  Private
export const createItem = async (req, res) => {
  try {
    const { title, category, description, rewardAmount, rewardCurrency, emergencyContact, qrCodeId } = req.body;

    if (!title) {
      return errorResponse(res, 400, 'Please provide an item title');
    }

    const item = await Item.create({
      owner: req.user.id,
      title,
      category: category || 'other',
      description: description || '',
      rewardAmount: rewardAmount || 0,
      rewardCurrency: rewardCurrency || 'USD',
      emergencyContact: emergencyContact || '',
      qrCodeId: qrCodeId || null,
    });

    return successResponse(res, 201, 'Item registered successfully', { item });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update item status or details
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, owner: req.user.id });
    if (!item) {
      return errorResponse(res, 404, 'Item not found or unauthorized');
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return successResponse(res, 200, 'Item updated successfully', { item: updatedItem });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

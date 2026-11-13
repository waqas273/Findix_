import { QRItem } from '../models/QRItem.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/mediaService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get all items registered by the authenticated user
 * @route   GET /api/items
 * @access  Private (protect)
 */
export const getMyItems = async (req, res) => {
  try {
    const items = await QRItem.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Your registered items retrieved', { items });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Get single item details for owner
 * @route   GET /api/items/:id
 * @access  Private (protect)
 */
export const getItemById = async (req, res) => {
  try {
    const item = await QRItem.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'Item not found or unauthorized');
    }

    return successResponse(res, 200, 'Item details retrieved', { item });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Update privacy settings for an item (showWhatsApp, showPhone, etc.)
 * @route   PATCH /api/items/:id/privacy
 * @access  Private (protect)
 */
export const updateItemPrivacy = async (req, res) => {
  try {
    const item = await QRItem.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'Item not found or unauthorized');
    }

    const { privacySettings, customContact } = req.body;

    if (privacySettings) {
      item.privacySettings = {
        showName: privacySettings.showName !== undefined ? Boolean(privacySettings.showName) : item.privacySettings.showName,
        showPhone: privacySettings.showPhone !== undefined ? Boolean(privacySettings.showPhone) : item.privacySettings.showPhone,
        showWhatsApp: privacySettings.showWhatsApp !== undefined ? Boolean(privacySettings.showWhatsApp) : item.privacySettings.showWhatsApp,
        allowInAppChat: privacySettings.allowInAppChat !== undefined ? Boolean(privacySettings.allowInAppChat) : item.privacySettings.allowInAppChat,
      };
    }

    if (customContact) {
      item.customContact = {
        phone: customContact.phone !== undefined ? customContact.phone.trim() : item.customContact.phone,
        whatsApp: customContact.whatsApp !== undefined ? customContact.whatsApp.trim() : item.customContact.whatsApp,
      };
    }

    await item.save();

    return successResponse(res, 200, 'Privacy settings updated successfully', { item });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Update item details, reward note, and lost recovery status
 * @route   PATCH /api/items/:id/details
 * @access  Private (protect)
 */
export const updateItemDetails = async (req, res) => {
  try {
    const item = await QRItem.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'Item not found or unauthorized');
    }

    const { itemName, returnRewardNote, isLost, status } = req.body;

    if (itemName !== undefined) item.itemName = itemName.trim();
    if (returnRewardNote !== undefined) item.returnRewardNote = returnRewardNote.trim();
    if (isLost !== undefined) item.isLost = isLost === true || isLost === 'true';
    if (status && ['claimed', 'inactive', 'unclaimed'].includes(status)) item.status = status;

    // Handle optional image replacement
    if (req.file) {
      // Remove old asset from Cloudinary if existed
      if (item.itemImage && item.itemImage.public_id) {
        await deleteFromCloudinary(item.itemImage.public_id).catch(() => {});
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, 'items');
      item.itemImage = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    await item.save();

    return successResponse(res, 200, 'Item details updated successfully', { item });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Delete or unbind an item and clean up assets
 * @route   DELETE /api/items/:id
 * @access  Private (protect)
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await QRItem.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'Item not found or unauthorized');
    }

    // Clean up image from Cloudinary
    if (item.itemImage && item.itemImage.public_id) {
      await deleteFromCloudinary(item.itemImage.public_id).catch(() => {});
    }

    await QRItem.findByIdAndDelete(item._id);

    return successResponse(res, 200, 'Item removed successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

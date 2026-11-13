import { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  deleteMultipleFromCloudinary 
} from '../utils/mediaService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Upload a single image to Cloudinary
// @route   POST /api/upload/image
// @access  Private (protect)
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please select an image file to upload');
    }

    const folder = req.body.folder || 'products';
    const result = await uploadToCloudinary(req.file.buffer, folder);

    return successResponse(res, 201, 'Image uploaded and optimized successfully', {
      url: result.url || result.secure_url,
      secure_url: result.secure_url || result.url,
      public_id: result.public_id || '',
      media: result,
    });
  } catch (error) {
    console.error('uploadSingleImage error:', error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Upload multiple images (e.g. for product galleries)
// @route   POST /api/upload/multiple
// @access  Private (protect)
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 400, 'Please select at least one image file');
    }

    const folder = req.body.folder || 'products';
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, folder)
    );

    const results = await Promise.all(uploadPromises);

    return successResponse(res, 201, `${results.length} image(s) uploaded successfully`, {
      images: results.map((r) => ({ url: r.url || r.secure_url, public_id: r.public_id })),
      media: results,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Delete media asset from Cloudinary
// @route   DELETE /api/upload/image
// @access  Private (protect)
export const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      return errorResponse(res, 400, 'Please specify the public_id of the media asset to delete');
    }

    const result = await deleteFromCloudinary(public_id);

    return successResponse(res, 200, 'Media asset removed successfully', { result });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

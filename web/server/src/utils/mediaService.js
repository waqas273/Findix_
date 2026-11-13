import cloudinary from '../config/cloudinary.js';

// Valid structured Cloudinary target folders
export const CLOUDINARY_FOLDERS = {
  USERS: 'findix/users',
  ITEMS: 'findix/items',
  PRODUCTS: 'findix/products',
  COMMUNITY: 'findix/community',
};

/**
 * Upload an in-memory buffer directly to Cloudinary using upload_stream
 * Automatically optimizes format (f_auto) and compression (q_auto).
 * 
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {String} folder - One of 'users', 'items', 'products', 'community' or full folder path
 * @param {Object} customOptions - Additional Cloudinary transformation/upload options
 * @returns {Promise<Object>} Standardized image metadata
 */
export const uploadToCloudinary = (buffer, folder = 'items', customOptions = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new Error('Invalid file buffer provided for Cloudinary upload'));
    }

    // Determine target folder
    const targetFolder = CLOUDINARY_FOLDERS[folder.toUpperCase()] || `findix/${folder}`;

    const uploadOptions = {
      folder: targetFolder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      ...customOptions,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error);
          return reject(new Error(error.message || 'Cloudinary upload failed'));
        }

        resolve({
          public_id: result.public_id,
          url: result.secure_url,
          secure_url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Remove an orphan media asset from Cloudinary by public_id
 * 
 * @param {String} publicId - Cloudinary public_id (e.g. findix/items/xyz123)
 * @returns {Promise<Object>} Cloudinary destruction result
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return { result: 'noop', message: 'No public_id supplied' };

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`[Cloudinary Deletion Error] Failed to delete asset '${publicId}':`, error.message);
    throw new Error(`Media cleanup failed: ${error.message}`);
  }
};

/**
 * Batch delete multiple assets from Cloudinary
 * 
 * @param {Array<String>} publicIds - Array of public_ids
 * @returns {Promise<Object>} Deletion summary
 */
export const deleteMultipleFromCloudinary = async (publicIds = []) => {
  const validIds = publicIds.filter(Boolean);
  if (!validIds.length) return { deleted: {} };

  try {
    const result = await cloudinary.api.delete_resources(validIds);
    return result;
  } catch (error) {
    console.error('[Cloudinary Batch Deletion Error]:', error.message);
    throw new Error(`Batch media cleanup failed: ${error.message}`);
  }
};

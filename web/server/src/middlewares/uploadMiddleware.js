import multer from 'multer';

// 1. In-memory storage engine
const storage = multer.memoryStorage();

// 2. Strict MIME-type whitelisting
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported file type '${file.mimetype}'. Only PNG, JPG, JPEG, and WEBP image formats are permitted.`
    );
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// 3. Multer instance with 5MB ceiling
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
    files: 10, // Max 10 files per request
  },
});

/**
 * Higher-order middleware wrapper that catches Multer limit and validation errors
 * cleanly and transforms them into standard API JSON error responses.
 */
export const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        // Handle Multer-specific limit violations
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File upload failed: File size exceeds the maximum limit of 5MB.',
              error: err.code,
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'File upload failed: Exceeded maximum allowed file count.',
              error: err.code,
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: `Unexpected file field '${err.field}'. Please verify request payload.`,
              error: err.code,
            });
          }
          return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`,
            error: err.code,
          });
        }

        // Handle custom MIME-type rejection
        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message,
            error: 'INVALID_FILE_TYPE',
          });
        }

        // Generic error
        return res.status(500).json({
          success: false,
          message: err.message || 'Error occurred during file processing',
        });
      }

      next();
    });
  };
};

// Convenience upload middlewares with error-handling built in
export const uploadSingle = (fieldName = 'image') => handleUpload(upload.single(fieldName));
export const uploadArray = (fieldName = 'images', maxCount = 5) => handleUpload(upload.array(fieldName, maxCount));
export const uploadFields = (fieldsArray = []) => handleUpload(upload.fields(fieldsArray));

import { body, validationResult } from 'express-validator';

// Middleware to evaluate validation results and respond with structured errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please verify the submitted data.',
      errors: formattedErrors,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// Registration validation chain
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email format')
    .normalizeEmail({ gmail_remove_dots: false }), // preserve dots in Gmail addresses
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City name cannot exceed 50 characters'),
  body('phone')
    .optional()
    .trim(),
  body('role')
    .optional()
    .isIn(['buyer', 'admin'])
    .withMessage('Role must be either buyer or admin'),
  handleValidationErrors,
];

// Login validation chain
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }), // preserve dots in Gmail addresses
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

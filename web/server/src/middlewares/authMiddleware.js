import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Protect middleware: Verifies JWT token from Authorization header or HTTP-only cookie
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Fallback to HTTP-only cookie
  else if (req.cookies && (req.cookies.findix_token || req.cookies.token)) {
    token = req.cookies.findix_token || req.cookies.token;
  }

  // Token missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No access token provided in header or cookie.',
    });
  }

  try {
    // Verify token integrity and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'findix_super_secret_jwt_key_2026_lost_but_never_gone'
    );

    // Retrieve user and ensure account still exists
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.',
      });
    }

    // Attach user to request object
    req.user = user;
    return next();
  } catch (error) {
    let errorMessage = 'Not authorized. Access token is invalid or expired.';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Session expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Malformed token. Verification failed.';
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts access to specified roles (e.g. 'admin', 'buyer')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in first.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${roles.join(', ')}]`,
      });
    }

    return next();
  };
};

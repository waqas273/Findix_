import jwt from 'jsonwebtoken';

/**
 * Generate signed JWT containing user ID and role
 */
export const generateToken = (userId, role = 'buyer') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'findix_super_secret_jwt_key_2026_lost_but_never_gone',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

/**
 * Send Token Response: Sets secure HTTP-Only cookie and returns sanitized JSON payload
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Convert mongoose doc if necessary
  const sanitizedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    city: user.city,
    country: user.country,
    avatar: user.avatar,
    phone: user.phone,
    createdAt: user.createdAt,
  };

  return res
    .status(statusCode)
    .cookie('findix_token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      data: {
        token,
        user: sanitizedUser,
      },
      timestamp: new Date().toISOString(),
    });
};


import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { sendTokenResponse, generateToken } from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, city, country, phone, role } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return errorResponse(res, 400, 'An account with this email address already exists');
    }

    // Create user (password automatically hashed with 12 salt rounds in pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      city: city || '',
      country: country || 'Pakistan',
      phone: phone || '',
      role: role && ['buyer', 'admin'].includes(role) ? role : 'buyer',
      authProvider: 'local',
    });

    return sendTokenResponse(user, 201, res, 'User account registered successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Check if email is already registered (pre-OTP gate)
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return errorResponse(res, 400, 'Email address is required');
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() }).select('_id').lean();

    return res.status(200).json({
      success: true,
      exists: Boolean(exists),
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password credentials');
    }

    return sendTokenResponse(user, 200, res, 'Authenticated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Authenticate or register user via Google OAuth ID Token / Credential
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential, tokenId } = req.body;
    const tokenToVerify = credential || tokenId;

    if (!tokenToVerify) {
      return errorResponse(res, 400, 'Google authentication token is required');
    }

    let payload;
    try {
      // 1. Verify ID token via Google OAuth2 client if client ID is configured
      if (process.env.GOOGLE_CLIENT_ID) {
        const ticket = await client.verifyIdToken({
          idToken: tokenToVerify,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      }
    } catch (verifyError) {
      console.warn('Google token verification fallback:', verifyError.message);
    }

    // 2. Fallback token verification via official Google endpoint if needed
    if (!payload) {
      try {
        const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenToVerify)}`);
        if (infoRes.ok) {
          payload = await infoRes.json();
        } else {
          return errorResponse(res, 401, 'Invalid or expired Google authorization token');
        }
      } catch (fetchErr) {
        return errorResponse(res, 401, 'Unable to verify Google credentials with authorization server');
      }
    }

    if (!payload || !payload.email) {
      return errorResponse(res, 400, 'Google account does not provide a valid email address');
    }

    const { email, name, picture, sub } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = sub;
        needsSave = true;
      }
      if (!user.avatar?.url && picture) {
        user.avatar = { public_id: '', url: picture };
        needsSave = true;
      }
      if (normalizedEmail === 'admin@findix.pk' && user.role !== 'admin') {
        user.role = 'admin';
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    } else {
      // Register new user automatically from Google Profile
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId: sub,
        authProvider: 'google',
        role: normalizedEmail === 'admin@findix.pk' ? 'admin' : 'buyer',
        avatar: {
          public_id: '',
          url: picture || '',
        },
        city: 'Islamabad',
        country: 'Pakistan',
      });
    }

    return sendTokenResponse(user, 200, res, 'Google session authenticated successfully');
  } catch (error) {
    console.error('googleAuth error:', error);
    return errorResponse(res, 500, error.message || 'Google authentication process failed');
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private (protect)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User profile not found');
    }

    return successResponse(res, 200, 'Profile retrieved successfully', { user });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Private (protect)
export const refreshToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User profile not found');
    }

    return sendTokenResponse(user, 200, res, 'Token refreshed successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Log user out / clear HTTP-only cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('findix_token', 'none', {
    expires: new Date(Date.now() + 5 * 1000), // expire in 5 seconds
    httpOnly: true,
  });

  return successResponse(res, 200, 'Logged out successfully');
};

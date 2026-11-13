import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleAuth,
  getMe, 
  refreshToken, 
  logoutUser,
  checkEmailExists,
} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { validateRegister, validateLogin } from '../middlewares/authValidation.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/check-email', checkEmailExists);
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/google', googleAuth);
router.post('/logout', logoutUser);

// Protected Authentication Endpoints
router.get('/me', protect, getMe);
router.post('/refresh', protect, refreshToken);

// RBAC Protected Test/Admin Route
router.get('/admin-check', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Findix Admin Control Center',
    admin: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

export default router;

const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, requestOtp, verifyOtp, getMe, updateLanguage } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Rate limiter for OTP requests (Dynamic based on environment)
const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: process.env.NODE_ENV === 'development' ? 500 : 5,
  message: { message: 'Too many OTP requests from this IP, please try again after an hour' }
});

router.post('/register', registerUser);

// Explicit OTP flows
router.post('/otp/request', otpRequestLimiter, requestOtp);
router.post('/otp/verify', verifyOtp);

// Legacy method fallback deleted

router.get('/me', protect, getMe);
router.put('/language', protect, updateLanguage);

module.exports = router;

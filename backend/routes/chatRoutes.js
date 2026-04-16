const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleChat } = require('../controllers/chatController');

// Only allow students to access the chatbot
router.post('/', protect, authorize('Student'), handleChat);

module.exports = router;

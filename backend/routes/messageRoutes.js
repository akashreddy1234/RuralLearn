const express = require('express');
const router = express.Router();
const { sendMessage, getThread, getTeacherThreads, markRead } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send', authorize('Parent', 'Teacher', 'Admin'), sendMessage);
router.post('/read', authorize('Parent', 'Teacher', 'Admin'), markRead);
router.get('/thread/:studentId/:subject/:otherUserId', authorize('Parent', 'Teacher', 'Admin'), getThread);
router.get('/threads/teacher', authorize('Teacher', 'Admin'), getTeacherThreads);

module.exports = router;

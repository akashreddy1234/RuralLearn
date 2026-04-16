const express = require('express');
const { getTeacherDashboard, getStudentDashboard, getParentDashboard, getTeacherAnalytics } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/teacher').get(protect, authorize('Teacher', 'Admin'), getTeacherDashboard);
router.route('/teacher/analytics').get(protect, authorize('Teacher', 'Admin'), getTeacherAnalytics);
router.route('/student').get(protect, getStudentDashboard);
router.route('/parent').get(protect, authorize('Parent', 'Admin'), getParentDashboard);

module.exports = router;

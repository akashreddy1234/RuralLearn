const express = require('express');
const { getLessons, getLessonById, createLesson, getSubjects, getMyLessons, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get('/subjects', protect, getSubjects);

router.get('/me', protect, authorize('Teacher'), getMyLessons);

router.route('/')
  .get(protect, getLessons)
  .post(protect, authorize('Teacher', 'Admin'), upload.single('document'), createLesson);

router.route('/:id')
  .get(protect, getLessonById)
  .put(protect, authorize('Teacher', 'Admin'), upload.single('document'), updateLesson)
  .delete(protect, authorize('Teacher', 'Admin'), deleteLesson);

module.exports = router;

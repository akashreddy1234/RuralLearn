const express = require('express');
const { getQuizzes, submitQuiz, createQuiz, getMyQuizzes, updateQuiz, deleteQuiz, getNextQuestion } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/me', protect, authorize('Teacher'), getMyQuizzes);

router.route('/')
  .post(protect, authorize('Teacher', 'Admin'), createQuiz);
  
router.route('/:id')
  .put(protect, authorize('Teacher', 'Admin'), updateQuiz)
  .delete(protect, authorize('Teacher', 'Admin'), deleteQuiz);
  
router.route('/lesson/:lessonId')
  .get(protect, getQuizzes);

router.post('/lesson/:lessonId/next', protect, getNextQuestion);

router.post('/submit', protect, submitQuiz);

module.exports = router;

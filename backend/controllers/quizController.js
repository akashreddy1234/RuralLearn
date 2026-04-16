const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const { awardPoints, evaluateBadges } = require('../services/gamificationService');
const { calculateCI, determineDifficulty } = require('../services/adaptiveEngine');

const getQuizzes = async (req, res) => {
  const { lessonId } = req.params;
  const { difficultyLevel, all } = req.query; // optional
  
  try {
    let filter = { lessonId };
    
    if (all === 'true') {
      const quizzes = await Quiz.find(filter);
      return res.json(quizzes);
    }

    if (difficultyLevel) {
      filter.difficultyLevel = difficultyLevel;
    } else {
      // By default, fetch 'easy' if not determined or all of them
      filter.difficultyLevel = 'easy'; // initial state
    }
    
    // Attempt to make it adaptive if user has past progress
    const pastProgress = await Progress.findOne({ userId: req.user._id, lessonId });
    if (pastProgress && !difficultyLevel) {
       const ciScore = calculateCI(pastProgress);
       const adaptiveDiff = determineDifficulty(ciScore);
       filter.difficultyLevel = adaptiveDiff;
    }

    const quizzes = await Quiz.find(filter);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitQuiz = async (req, res) => {
  const { lessonId, answers, timeSpentSec } = req.body; 
  // answers: [{ quizId, selectedOption }]
  try {
    let correctCount = 0;
    let earnedWeights = 0;
    let totalWeights = 0;

    for (let ans of answers) {
      const quiz = await Quiz.findById(ans.quizId);
      if (quiz) {
         let w = 1;
         if (quiz.difficultyLevel === 'medium') w = 2;
         if (quiz.difficultyLevel === 'hard') w = 3;
         totalWeights += w;

         if (quiz.correctAnswer === ans.selectedOption) {
           correctCount++;
           earnedWeights += w;
           await awardPoints(req.user._id, 'correct_answer');
         }
      }
    }

    const accuracy = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;
    
    // Purely CI-driven weight based calculation
    const attemptCI = totalWeights > 0 ? (earnedWeights / totalWeights) * 100 : 0;
    
    // Update Progress with explicit teacher binding 
    const lessonDoc = await Lesson.findById(lessonId);
    let progress = await Progress.findOne({ userId: req.user._id, lessonId });
    if (!progress) {
      progress = new Progress({ 
        userId: req.user._id, 
        lessonId,
        teacherId: lessonDoc.uploadedBy
      });
    }

    progress.accuracy = (progress.accuracy + accuracy) / 2; // moving avg for simplicity
    progress.CI_score = progress.CI_score === 0 ? attemptCI : (progress.CI_score + attemptCI) / 2;
    progress.completionStatus = 'completed';

    await progress.save();
    await awardPoints(req.user._id, 'lesson_completed'); // extra points for completing lesson quiz
    
    // Evaluate if this specific quiz completion pushed them over any enabled Badge threshold parameters
    await evaluateBadges(req.user._id);

    res.json({
      message: 'Quiz submitted successfully',
      correctCount,
      total: answers.length,
      accuracy,
      newCIScore: progress.CI_score,
      nextDifficulty: determineDifficulty(progress.CI_score)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNextQuestion = async (req, res) => {
  const { lessonId } = req.params;
  const { difficultyLevel, attemptedQIds } = req.body;
  
  try {
    let filter = { lessonId, _id: { $nin: attemptedQIds || [] } };
    
    // Try to get requested difficulty
    let pool = await Quiz.find({ ...filter, difficultyLevel });
    if (pool.length === 0) {
      // Fallback: get any difficulty
      pool = await Quiz.find(filter);
    }
    
    if (pool.length === 0) {
      return res.json(null); // No more questions
    }
    
    const nextQ = pool[Math.floor(Math.random() * pool.length)];
    res.json(nextQ);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createQuiz = async (req, res) => {
  const { lessonId, difficultyLevel, question, options, correctAnswer } = req.body;
  try {
    const quiz = new Quiz({
      lessonId, difficultyLevel, question, options, correctAnswer
    });
    const created = await quiz.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const lessons = await Lesson.find({ uploadedBy: req.user._id }).select('_id');
    const lessonIds = lessons.map(l => l._id);
    
    const quizzes = await Quiz.find({ lessonId: { $in: lessonIds } })
      .populate('lessonId', 'title subject');
      
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    const lesson = await Lesson.findById(quiz.lessonId);
    if (lesson.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { difficultyLevel, question, options, correctAnswer } = req.body;
    
    quiz.difficultyLevel = difficultyLevel || quiz.difficultyLevel;
    quiz.question = question || quiz.question;
    quiz.options = options || quiz.options;
    quiz.correctAnswer = correctAnswer || quiz.correctAnswer;
    
    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    const lesson = await Lesson.findById(quiz.lessonId);
    if (lesson.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to delete' });
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuizzes, submitQuiz, createQuiz, getMyQuizzes, updateQuiz, deleteQuiz, getNextQuestion };

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  difficultyLevel: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);

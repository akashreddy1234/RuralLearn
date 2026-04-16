const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  accuracy: { type: Number, default: 0 }, // percentage
  speed: { type: Number, default: 0 },    // score based on time
  consistency: { type: Number, default: 0 }, // score based on past attempts
  CI_score: { type: Number, default: 0 }, // Competency Index
  completionStatus: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed'], 
    default: 'in_progress' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);

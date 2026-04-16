const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Badge', 'Level', 'Milestone'], 
    required: true 
  },
  description: { type: String, required: true },
  pointsAwarded: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);

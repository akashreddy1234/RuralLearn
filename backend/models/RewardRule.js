const mongoose = require('mongoose');

const rewardRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Quiz Master', '7-Day Streak', 'Scholar'
  description: { type: String },
  icon: { type: String }, // e.g., lucide-react icon name or simple string
  type: { type: String, enum: ['quiz_score', 'streak', 'lessons_completed'], required: true },
  threshold: { type: Number, required: true },
  isEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RewardRule', rewardRuleSchema);

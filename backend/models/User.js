const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['Student', 'Teacher', 'Parent', 'Admin'], 
    default: 'Student' 
  },
  languagePreference: { type: String, default: 'English' },
  schoolCode: { type: String },
  totalPoints: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastLoginDate: { type: Date },

  // OTP Security Fields
  otpHash: { type: String },
  otpExpiry: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  otpLockUntil: { type: Date },
  lastOtpSentAt: { type: Date },

  // Teacher specific
  subjects: [{ type: String }],

  // Student specific
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentEmail: { type: String },
  badges: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

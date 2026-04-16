const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed }, // Arbitrary JSON data from offline action
  status: { 
    type: String, 
    enum: ['pending', 'synced', 'failed'], 
    default: 'pending' 
  },
  errorReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SyncLog', syncLogSchema);

const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  language: { type: String, required: true },
  mediaType: { 
    type: String, 
    enum: ['Text', 'Image', 'Audio', 'Video', 'Document', 'Mixed'], 
    required: true 
  },
  fileURL: { type: String }, // Legacy/Generic file
  documentUrl: { type: String }, // For uploaded PDFs, DOCs, PPTs
  videoUrl: { type: String }, // For YouTube or external video links
  externalLink: { type: String }, // For other external resources
  content: { type: String }, // For text-based lessons
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);

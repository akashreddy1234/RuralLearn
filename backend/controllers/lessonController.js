const Lesson = require('../models/Lesson');
const User = require('../models/User');

// Get lesson by ID
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('uploadedBy', 'name email');
    if (lesson) {
      res.json(lesson);
    } else {
      res.status(404).json({ message: 'Lesson not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLessons = async (req, res) => {
  try {
    // Basic filter by subject or language if provided
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.language) filter.language = req.query.language;

    const lessons = await Lesson.find(filter).populate('uploadedBy', 'name email');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLesson = async (req, res) => {
  const { title, language, mediaType, content, videoUrl, externalLink } = req.body;
  
  let documentUrl = '';
  if (req.file) {
    // Save relative path to serve statically
    documentUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const teacher = await User.findById(req.user._id);
    const teacherSubject = teacher?.subjects?.[0];
    
    // Check if the teacher has an assigned subject
    if (!teacherSubject) {
      return res.status(400).json({ message: 'No subject assigned. Contact admin.' });
    }

    const lesson = new Lesson({
      title,
      subject: teacherSubject,
      language,
      mediaType: mediaType || 'Mixed',
      content,
      videoUrl,
      externalLink,
      documentUrl,
      uploadedBy: req.user._id
    });
    const createdLesson = await lesson.save();
    res.status(201).json(createdLesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubjects = async (req, res) => {
  try {
    const subjects = await Lesson.distinct('subject');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyLessons = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id);
    const teacherSubject = teacher?.subjects?.[0];

    const filter = { uploadedBy: req.user._id };
    if (teacherSubject) {
      filter.subject = teacherSubject;
    }

    const lessons = await Lesson.find(filter).sort({ createdAt: -1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    
    if (lesson.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, language, mediaType, content, videoUrl, externalLink } = req.body;
    
    lesson.title = title || lesson.title;
    // Prevent overriding subject
    // lesson.subject is kept strictly as originally assigned
    lesson.language = language || lesson.language;
    lesson.mediaType = mediaType || lesson.mediaType;
    lesson.content = content !== undefined ? content : lesson.content;
    lesson.videoUrl = videoUrl !== undefined ? videoUrl : lesson.videoUrl;
    lesson.externalLink = externalLink !== undefined ? externalLink : lesson.externalLink;
    
    if (req.file) {
      lesson.documentUrl = `/uploads/${req.file.filename}`;
    }

    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    
    if (lesson.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to delete' });
    }

    await lesson.deleteOne();
    
    // Cascade delete mapped quizzes and progress
    const Quiz = require('../models/Quiz');
    const Progress = require('../models/Progress');
    await Quiz.deleteMany({ lessonId: lesson._id });
    await Progress.deleteMany({ lessonId: lesson._id });

    res.json({ message: 'Lesson removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLessons, getLessonById, createLesson, getSubjects, getMyLessons, updateLesson, deleteLesson };

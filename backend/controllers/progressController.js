const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');

const getUserProgress = async (req, res) => {
  const { userId } = req.params;
  
  // Optionally restrict so users can only see their own progress,
  // unless they are Teacher, Parent or Admin.
  if (
    req.user._id.toString() !== userId && 
    req.user.role === 'Student'
  ) {
    return res.status(403).json({ message: 'Not authorized to view this progress' });
  }

  try {
    const progressList = await Progress.find({ userId })
      .populate('lessonId', 'title subject');
    res.json(progressList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProgress };

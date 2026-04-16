const User = require('../models/User');
const RewardRule = require('../models/RewardRule');
const Progress = require('../models/Progress');

// @desc    Get all users grouped or listed
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-otpHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a Teacher
// @route   POST /api/admin/users/teacher
// @access  Private (Admin)
const createTeacher = async (req, res) => {
  const { name, email, subjects } = req.body;
  try {
    const cleanEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const teacher = await User.create({
      name,
      email: cleanEmail,
      role: 'Teacher',
      subjects: subjects || []
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Teacher
// @route   PUT /api/admin/users/teacher/:id
// @access  Private (Admin)
const updateTeacher = async (req, res) => {
  const { name, subjects } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    if (name) user.name = name;
    if (subjects) user.subjects = subjects;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Admins cannot delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Cleanup progress arrays mapping back to deleting entity
    await Progress.deleteMany({ userId: req.params.id }); 

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Reward Rules
// @route   GET /api/admin/settings/rewards
// @access  Private (Admin)
const getRewardRules = async (req, res) => {
  try {
    let rules = await RewardRule.find({});
    // Auto-Initialize system defaults if matrix originates empty
    if (rules.length === 0) {
      const defaultRules = [
        { name: 'Quiz Master', description: 'Score perfectly on a lesson quiz', type: 'quiz_score', threshold: 100, isEnabled: true, icon: 'Award' },
        { name: '7-Day Streak', description: 'Log in for 7 consecutive days', type: 'streak', threshold: 7, isEnabled: true, icon: 'Flame' },
        { name: 'Scholar', description: 'Complete 3 full lessons', type: 'lessons_completed', threshold: 3, isEnabled: true, icon: 'BookOpen' }
      ];
      rules = await RewardRule.insertMany(defaultRules);
    }
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Reward Rule
// @route   PUT /api/admin/settings/rewards/:id
// @access  Private (Admin)
const updateRewardRule = async (req, res) => {
  const { isEnabled, threshold } = req.body;
  try {
    const rule = await RewardRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });

    if (isEnabled !== undefined) rule.isEnabled = isEnabled;
    if (threshold !== undefined) rule.threshold = threshold;

    await rule.save();
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers, createTeacher, updateTeacher, deleteUser,
  getRewardRules, updateRewardRule
};

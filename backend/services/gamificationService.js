const User = require('../models/User');
const RewardRule = require('../models/RewardRule');

const REWARD_RULES = {
  correct_answer: 10,
  lesson_completed: 50,
  daily_login: 5,
};

/**
 * Award points to a user based on an action.
 */
const awardPoints = async (userId, action) => {
  const points = REWARD_RULES[action] || 0;
  if (points > 0) {
    const user = await User.findById(userId);
    if (user) {
      user.totalPoints += points;
      await user.save();
    }
    return points;
  }
  return 0;
};

/**
 * Update the user's login streak.
 */
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user.lastLoginDate) {
    const lastLogin = new Date(user.lastLoginDate);
    lastLogin.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - lastLogin);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Logged in yesterday
      user.streak += 1;
      await awardPoints(userId, 'daily_login');
    } else if (diffDays > 1) {
      // Missed a day
      user.streak = 1;
      await awardPoints(userId, 'daily_login');
    }
    // If diffDays === 0, they already logged in today, do nothing to streak.
  } else {
    // First login
    user.streak = 1;
    await awardPoints(userId, 'daily_login');
  }

  user.lastLoginDate = new Date();
  await user.save();
  await evaluateBadges(userId); // Trigger badge checks after streak increments
  return user.streak;
};

/**
 * Evaluate and potentially award new badges to a user.
 */
const evaluateBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'Student') return;
    
    // Get all enabled rules
    const rules = await RewardRule.find({ isEnabled: true });
    if (rules.length === 0) return;

    let earnedNewBadge = false;
    const currentBadges = new Set(user.badges || []);

    // 1. Streak Evaluation
    const streakRules = rules.filter(r => r.type === 'streak');
    for (let rule of streakRules) {
      if (user.streak >= rule.threshold && !currentBadges.has(rule.name)) {
        currentBadges.add(rule.name);
        user.badges.push(rule.name);
        earnedNewBadge = true;
      }
    }

    // 2. Lessons Completed Evaluation
    const lessonRules = rules.filter(r => r.type === 'lessons_completed');
    if (lessonRules.length > 0) {
      const Progress = require('../models/Progress');
      const completedCount = await Progress.countDocuments({ userId, completionStatus: 'completed' });
      for (let rule of lessonRules) {
        if (completedCount >= rule.threshold && !currentBadges.has(rule.name)) {
          currentBadges.add(rule.name);
          user.badges.push(rule.name);
          earnedNewBadge = true;
        }
      }
    }

    // 3. Quiz Score Assessment
    const quizRules = rules.filter(r => r.type === 'quiz_score');
    if (quizRules.length > 0) {
      const Progress = require('../models/Progress');
      for (let rule of quizRules) {
        if (!currentBadges.has(rule.name)) {
          const perfectScores = await Progress.countDocuments({ userId, completionStatus: 'completed', accuracy: { $gte: rule.threshold } });
          if (perfectScores > 0) {
            currentBadges.add(rule.name);
            user.badges.push(rule.name);
            earnedNewBadge = true;
          }
        }
      }
    }

    if (earnedNewBadge) {
      await user.save();
    }
  } catch (error) {
    console.error('Badge Evaluation Error:', error);
  }
};

/**
 * Generate Leaderboard by top points.
 */
const generateLeaderboard = async (limit = 10) => {
  return await User.find({ role: 'Student' })
    .sort({ totalPoints: -1 })
    .select('name schoolCode totalPoints streak')
    .limit(limit);
};

module.exports = {
  awardPoints,
  updateStreak,
  generateLeaderboard,
  evaluateBadges
};

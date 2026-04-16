const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const User = require('../models/User');

// @desc    Get dashboard metrics for Teacher
// @route   GET /api/dashboard/teacher
// @access  Private (Teacher, Admin)
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // 1. Get all lessons created by this teacher
    const lessons = await Lesson.find({ uploadedBy: teacherId });
    const lessonIds = lessons.map(l => l._id);
    const totalLessons = lessons.length;

    // 2. Get total quizzes created for these lessons
    // (Ensure we get actual count even if no students took them)
    const totalQuizzes = await Quiz.countDocuments({ lessonId: { $in: lessonIds } });

    // 3. Get all progress records for these lessons
    const progressRecords = await Progress.find({ lessonId: { $in: lessonIds } })
      .populate('userId', 'name')
      .populate('lessonId', 'title subject');

    // 4. Calculate active students (unique userIds in progress)
    const uniqueStudents = new Set(progressRecords.map(p => p.userId._id.toString()));
    const totalActiveStudents = uniqueStudents.size;

    // 5. Calculate Average Class Score (Accuracy)
    const completedProgress = progressRecords.filter(p => p.completionStatus === 'completed');
    const totalAccuracy = completedProgress.reduce((sum, p) => sum + p.accuracy, 0);
    const avgScore = completedProgress.length > 0 
      ? Math.round(totalAccuracy / completedProgress.length) 
      : 0;

    // 6. Chart: Performance by Unit (Lesson)
    // Group completed progress by lesson title
    const performanceByUnitMap = {};
    completedProgress.forEach(p => {
       const title = p.lessonId.title;
       if (!performanceByUnitMap[title]) {
         performanceByUnitMap[title] = { totalScores: 0, count: 0 };
       }
       performanceByUnitMap[title].totalScores += p.accuracy;
       performanceByUnitMap[title].count += 1;
    });

    const performanceLabels = [];
    const performanceData = [];
    Object.keys(performanceByUnitMap).slice(0, 10).forEach(title => { // Limit to 10 for UI
      performanceLabels.push(title.length > 15 ? title.substring(0,15)+'...' : title);
      performanceData.push(Math.round(performanceByUnitMap[title].totalScores / performanceByUnitMap[title].count));
    });

    // 7. Chart: Student CI Distribution (Difficulty/Accuracy buckets)
    let easyCount = 0, mediumCount = 0, hardCount = 0; // bucket by CI_score or accuracy if CI_score is missing
    completedProgress.forEach(p => {
      const score = p.CI_score || p.accuracy;
      if (score >= 80) easyCount++;        // Doing very well
      else if (score >= 50) mediumCount++; // Needs some help
      else hardCount++;                         // Struggling
    });
    
    // Fallback pie charts if no data
    const ciLabels = ['Advanced (Avg >80%)', 'Intermediate (50-80%)', 'Needs Support (<50%)'];
    const ciData = completedProgress.length > 0 ? [easyCount, mediumCount, hardCount] : [0,0,0];

    // 8. Recent Activity (Latest progress updates on teacher's lessons)
    const recentActivity = progressRecords
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 4)
        .map(p => {
            return {
                id: p._id,
                studentName: p.userId.name,
                lessonTitle: p.lessonId.title,
                status: p.completionStatus,
                score: p.accuracy,
                date: p.updatedAt
            };
        });

    res.json({
      stats: {
        totalLessons,
        totalQuizzes,
        totalActiveStudents,
        avgScore
      },
      charts: {
        performance: {
          labels: performanceLabels.length > 0 ? performanceLabels : ['No Data'],
          data: performanceData.length > 0 ? performanceData : [0]
        },
        difficulty: {
           labels: ciLabels,
           data: ciData
        }
      },
      recentActivity
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching teacher dashboard data' });
  }
};


// @desc    Get dashboard metrics for Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const user = await User.findById(studentId);

    // 1. Get all progress records for this student
    const progressRecords = await Progress.find({ userId: studentId }).populate('lessonId', 'title subject');

    // 2. Lessons Done
    const completedProgress = progressRecords.filter(p => p.completionStatus === 'completed');
    const lessonsDone = completedProgress.length;

    // 3. Quiz Accuracy
    const totalAccuracy = completedProgress.reduce((acc, p) => acc + p.accuracy, 0);
    const avgAccuracy = lessonsDone > 0 ? Math.round(totalAccuracy / lessonsDone) : 0;

    // 4. Continue Learning (Top 2 in_progress lessons by recently updated)
    const continueLearning = progressRecords
        .filter(p => p.completionStatus === 'in_progress')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 2)
        .map(p => ({
            id: p.lessonId._id,
            title: p.lessonId.title,
            subject: p.lessonId.subject,
            // Calculate actual percentage, fallback to 0 if not calculated
            progressPct: p.accuracy || 0, 
            lastUpdated: p.updatedAt
        }));

    // 5. Mastery Progress (Group by subject and avg accuracy)
    const masteryMap = {};
    completedProgress.forEach(p => {
        const subject = p.lessonId?.subject || 'General';
        if (!masteryMap[subject]) {
            masteryMap[subject] = { total: 0, count: 0 };
        }
        masteryMap[subject].total += p.accuracy;
        masteryMap[subject].count += 1;
    });

    const masteryProgress = Object.keys(masteryMap).map(sub => ({
        subject: sub,
        percentage: Math.round(masteryMap[sub].total / masteryMap[sub].count)
    }));

    // 6. Weekly Learning Activity (Last 7 Days)
    const last7Days = [];
    const activityDataArray = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(today);
      dStart.setDate(today.getDate() - i);
      dStart.setHours(0, 0, 0, 0);
      
      const dEnd = new Date(today);
      dEnd.setDate(today.getDate() - i);
      dEnd.setHours(23, 59, 59, 999);
      
      last7Days.push(dStart.toLocaleDateString('en-US', { weekday: 'short' }));
      
      const count = progressRecords.filter(p => {
        const pDate = new Date(p.updatedAt);
        return pDate >= dStart && pDate <= dEnd;
      }).length;
      activityDataArray.push(count);
    }
    
    // 7. Dynamic Badge Evaluation Maps
    const RewardRule = require('../models/RewardRule');
    const allRules = await RewardRule.find({ isEnabled: true });
    const userBadges = new Set(user.badges || []);
    
    const badgesList = allRules.map(r => ({
      name: r.name,
      icon: r.icon,
      earned: userBadges.has(r.name)
    }));

    res.json({
      stats: {
        totalPoints: user.totalPoints || 0,
        streak: user.streak || 0,
        lessonsDone,
        avgAccuracy
      },
      charts: {
        activity: activityDataArray,
        activityLabels: last7Days
      },
      continueLearning,
      masteryProgress,
      badgesList
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching student dashboard data' });
  }
};

// @desc    Get dashboard metrics for Parent
// @route   GET /api/dashboard/parent
// @access  Private (Parent)
const getParentDashboard = async (req, res) => {
  try {
    const parentId = req.user._id;
    const child = await User.findOne({ parentId });
    
    if (!child) {
      return res.json({ child: null, metrics: null });
    }

    const progressRecords = await Progress.find({ userId: child._id }).populate({
        path: 'lessonId',
        select: 'title subject uploadedBy',
        populate: { path: 'uploadedBy', select: 'name _id' }
    });
    const completedProgress = progressRecords.filter(p => p.completionStatus === 'completed');
    
    const totalHoursStudied = completedProgress.length * 0.25;
    const totalQuizzesAttempted = progressRecords.length;
    const totalAccuracy = completedProgress.reduce((acc, p) => acc + p.accuracy, 0);
    const avgAccuracy = completedProgress.length > 0 ? Math.round(totalAccuracy / completedProgress.length) : 0;
    const overallScore = avgAccuracy;

    const masteryMap = {};
    completedProgress.forEach(p => {
        const subject = p.lessonId?.subject || 'General';
        const teacher = p.lessonId?.uploadedBy || null;
        if (!masteryMap[subject]) {
            masteryMap[subject] = { total: 0, count: 0, teacher: teacher };
        }
        masteryMap[subject].total += p.accuracy;
        masteryMap[subject].count += 1;
    });

    const subjectAnalysis = Object.keys(masteryMap).map(sub => ({
        subject: sub,
        percentage: Math.round(masteryMap[sub].total / masteryMap[sub].count),
        teacher: masteryMap[sub].teacher
    }));

    const last7Days = [];
    const activityDataArray = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(today);
      dStart.setDate(today.getDate() - i);
      dStart.setHours(0, 0, 0, 0);
      
      const dEnd = new Date(today);
      dEnd.setDate(today.getDate() - i);
      dEnd.setHours(23, 59, 59, 999);
      
      last7Days.push(dStart.toLocaleDateString('en-US', { weekday: 'short' }));
      
      const count = progressRecords.filter(p => {
        const pDate = new Date(p.updatedAt);
        return pDate >= dStart && pDate <= dEnd;
      }).length;
      activityDataArray.push(count);
    }

    res.json({
      child: {
        id: child._id,
        name: child.name,
        totalPoints: child.totalPoints,
        streak: child.streak
      },
      metrics: {
        totalHoursStudied: Number(totalHoursStudied.toFixed(1)),
        totalQuizzesAttempted,
        avgAccuracy,
        overallScore
      },
      charts: {
        activity: activityDataArray,
        activityLabels: last7Days,
        subjectAnalysis
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching parent dashboard data' });
  }
};

// @desc    Get detailed student analytics for Teacher (per-student CI, summaries, attention flags)
// @route   GET /api/dashboard/teacher/analytics
// @access  Private (Teacher, Admin)
const getTeacherAnalytics = async (req, res) => {
  try {
    const { calculateCI } = require('../services/adaptiveEngine');
    const teacherId = req.user._id;

    // 1. Get all lessons created by this teacher
    const lessons = await Lesson.find({ uploadedBy: teacherId });
    const lessonIds = lessons.map(l => l._id);

    if (lessonIds.length === 0) {
      return res.json({
        students: [],
        summary: { avgCI: 0, totalLessonsCompleted: 0, totalQuizzesTaken: 0 },
        requiresAttention: []
      });
    }

    // 2. Get all progress records for teacher's lessons, populate student name & lesson info
    const progressRecords = await Progress.find({ lessonId: { $in: lessonIds } })
      .populate('userId', 'name')
      .populate('lessonId', 'title subject');

    // 3. Group by student
    const studentMap = {};
    for (const p of progressRecords) {
      if (!p.userId) continue; // skip orphaned records
      const sid = p.userId._id.toString();
      if (!studentMap[sid]) {
        studentMap[sid] = {
          id: sid,
          name: p.userId.name,
          ciScores: [],
          lessonsCompleted: 0,
          quizzesTaken: 0,
          weakLesson: null,
          weakCI: Infinity
        };
      }
      const student = studentMap[sid];

      // Each progress record = one quiz attempt on a lesson
      student.quizzesTaken += 1;

      if (p.completionStatus === 'completed') {
        student.lessonsCompleted += 1;
      }

      // Compute CI for this record (use stored CI_score if present, else recalculate)
      const ci = p.CI_score > 0 ? p.CI_score : calculateCI({ accuracy: p.accuracy, speed: p.speed, consistency: p.consistency });
      student.ciScores.push(ci);

      // Track the weakest lesson
      if (ci < student.weakCI) {
        student.weakCI = ci;
        student.weakLesson = p.lessonId?.title || 'Unknown Lesson';
      }
    }

    // 4. Build per-student summary array
    const students = Object.values(studentMap).map(s => {
      const avgCI = s.ciScores.length > 0
        ? Math.round(s.ciScores.reduce((a, b) => a + b, 0) / s.ciScores.length)
        : 0;
      return {
        id: s.id,
        name: s.name,
        ci: avgCI,
        lessonsCompleted: s.lessonsCompleted,
        quizzesTaken: s.quizzesTaken,
        weakLesson: s.weakLesson
      };
    });

    // 5. Class-level summary
    const totalLessonsCompleted = students.reduce((sum, s) => sum + s.lessonsCompleted, 0);
    const totalQuizzesTaken = students.reduce((sum, s) => sum + s.quizzesTaken, 0);
    const avgCI = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.ci, 0) / students.length * 10) / 10
      : 0;

    // 6. Requires Attention: students with CI < 70
    const requiresAttention = students
      .filter(s => s.ci < 70)
      .map(s => ({ id: s.id, name: s.name, ci: s.ci, weakLesson: s.weakLesson }));

    res.json({
      students,
      summary: { avgCI, totalLessonsCompleted, totalQuizzesTaken },
      requiresAttention
    });

  } catch (error) {
    console.error('getTeacherAnalytics error:', error);
    res.status(500).json({ message: 'Server error fetching teacher analytics data' });
  }
};

module.exports = {
    getTeacherDashboard,
    getStudentDashboard,
    getParentDashboard,
    getTeacherAnalytics
};

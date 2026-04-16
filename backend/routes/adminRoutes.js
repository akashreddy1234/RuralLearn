const express = require('express');
const { 
  getUsers, createTeacher, updateTeacher, deleteUser,
  getRewardRules, updateRewardRule 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Role authorization explicit middleware inline
const adminProtect = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Chain protect middleware resolving token bounds
router.use(protect, adminProtect);

// User Management Endpoint Arrays
router.get('/users', getUsers);
router.post('/users/teacher', createTeacher);
router.put('/users/teacher/:id', updateTeacher);
router.delete('/users/:id', deleteUser);

// Platform Rules
router.get('/settings/rewards', getRewardRules);
router.put('/settings/rewards/:id', updateRewardRule);

module.exports = router;

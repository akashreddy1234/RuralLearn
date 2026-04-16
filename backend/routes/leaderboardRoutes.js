const express = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');
const router = express.Router();

// Leaderboard doesn't strictly need auth to view (or it can have it)
router.get('/', getLeaderboard);

module.exports = router;

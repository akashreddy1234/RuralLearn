const { generateLeaderboard } = require('../services/gamificationService');

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await generateLeaderboard(10);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };

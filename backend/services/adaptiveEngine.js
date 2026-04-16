/**
 * Adaptive Learning Engine
 */

const WEIGHTS = {
  accuracy: 0.5,
  speed: 0.3,
  consistency: 0.2
};

/**
 * Calculate the Competency Index (CI).
 * @param {Object} stats - The progress statistics
 * @param {number} stats.accuracy - Percentage (0-100)
 * @param {number} stats.speed - Score out of 100
 * @param {number} stats.consistency - Score out of 100
 * @returns {number} CI score
 */
const calculateCI = (stats) => {
  const accuracyScore = (stats.accuracy || 0) * WEIGHTS.accuracy;
  const speedScore = (stats.speed || 0) * WEIGHTS.speed;
  const consistencyScore = (stats.consistency || 0) * WEIGHTS.consistency;
  
  return accuracyScore + speedScore + consistencyScore;
};

/**
 * Determine the difficulty for the next quiz based on CI.
 * @param {number} ciScore - Competency Index
 * @returns {string} Difficulty string ('easy', 'medium', 'hard')
 */
const determineDifficulty = (ciScore) => {
  if (ciScore > 80) return 'hard';
  if (ciScore >= 50 && ciScore <= 80) return 'medium';
  return 'easy';
};

module.exports = {
  calculateCI,
  determineDifficulty
};

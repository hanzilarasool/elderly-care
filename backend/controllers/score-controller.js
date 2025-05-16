const Score = require('../models/Score');
const { analyzeScores } = require('./services/aiService');

const saveScore = async (req, res) => {
  try {
    const { score, moves } = req.body;
    console.log('Received score:', score, 'moves:', moves);
    const userId = req.user.id; // Assuming user is authenticated
    const newScore = new Score({ userId, score, moves });
    await newScore.save();
    res.status(201).json({ message: 'Score and moves saved' });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
};

const getScores = async (req, res) => {
  try {
    const userId = req.user.id;
    const scores = await Score.find({ userId }).sort({ createdAt: -1 });
    res.json({ scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
};

const analyzeUserScores = async (req, res) => {
  try {
    const userId = req.user.id;
    const scores = await Score.find({ userId });
    const result = await analyzeScores(scores); // Assume this returns suggestions
    res.json({ suggestions: result });
  } catch (error) {
    console.error('Error analyzing scores:', error);
    res.status(500).json({ error: 'Failed to analyze scores' });
  }
};

module.exports = {
  saveScore,
  getScores,
  analyzeUserScores,
};

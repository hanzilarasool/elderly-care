const express = require('express');
const router = express.Router();
const { saveScore, getScores, analyzeUserScores } = require('../controllers/score-controller');
const {protect} = require('../middleware/auth'); // Ensure user is authenticated

router.post('/save', protect, saveScore);
router.get('/history', protect, getScores);
router.get('/analyze', protect, analyzeUserScores);

module.exports = router;
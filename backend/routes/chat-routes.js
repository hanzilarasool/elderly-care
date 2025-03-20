// routes/chat.js
const express = require('express');
const router = express.Router();
const { generateMedicalResponse } = require('../controllers/chat-controllers');
const {protect} = require('../middleware/auth');

router.post('/', protect, generateMedicalResponse);

module.exports = router;
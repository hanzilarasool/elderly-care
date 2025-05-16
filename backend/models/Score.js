const mongoose = require('mongoose');
const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  moves: { type: Number},
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Score', scoreSchema);
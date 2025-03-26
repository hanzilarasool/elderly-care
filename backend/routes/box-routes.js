
// routes/boxes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  boxes,
  addMedicineToBox,
  deleteMedicineFromBox,
  updateMedicineInBox
} = require('../controllers/box-controller');

// Add authentication middleware to all box routes
router.get('/', protect, boxes);
router.post('/:boxId/medicines', protect, addMedicineToBox);
router.delete('/:boxId/medicines/:medicineId', protect, deleteMedicineFromBox);
router.put('/:boxId/medicines/:medicineId', protect, updateMedicineInBox);

module.exports = router; 
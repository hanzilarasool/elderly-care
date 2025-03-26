// backend/routes/boxes.js
const express = require('express');
const router = express.Router();
const Box = require('../models/box-model'); 


  const boxes = async (req, res) => {
    try {
      console.log('Fetching boxes for user:', req.user.id); // Add this
      const boxes = await Box.find({ user: req.user.id });
      console.log('Found boxes:', boxes); // Add this
      res.json(boxes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  const addMedicineToBox = async (req, res) => {
    try {
      const box = await Box.findOneAndUpdate(
        { _id: req.params.boxId, user: req.user.id },
        { $push: { medicines: req.body } },
        { new: true }
      );
  
      if (!box) return res.status(404).json({ message: 'Box not found' });
      res.json(box);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
 

// controllers/medicineController.js
const deleteMedicineFromBox = async (req, res) => {
    try {
      const box = await Box.findOneAndUpdate(
        { 
          _id: req.params.boxId,
          user: req.user.id // Add user verification
        },
        { $pull: { medicines: { _id: req.params.medicineId } } },
        { new: true }
      );
  
      if (!box) return res.status(404).json({ message: 'Medicine not found' });
      res.json(box);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const updateMedicineInBox = async (req, res) => {
    try {
      const box = await Box.findOneAndUpdate(
        { 
          _id: req.params.boxId,
          user: req.user.id, // Add user verification
          "medicines._id": req.params.medicineId
        },
        { $set: { "medicines.$": req.body } },
        { new: true }
      );
      
      if (!box) return res.status(404).json({ message: 'Medicine not found' });
      res.json(box);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };















//   const deleteMedicineFromBox = async (req, res) => {
//     try {
//       const box = await Box.findByIdAndUpdate(
//         req.params.boxId,
//         { $pull: { medicines: { _id: req.params.medicineId } } },
//         { new: true } // Corrected placement of the options object
//       );
  
//       if (!box) {
//         return res.status(404).json({ message: 'Box not found' });
//       }
  
//       res.json(box);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

//   update medicine
// const updateMedicineInBox = async (req, res) => {
//     try {
//       const box = await Box.findOneAndUpdate(
//         {
//           _id: req.params.boxId,
//           "medicines._id": req.params.medicineId
//         },
//         {
//           $set: {
//             "medicines.$.name": req.body.name,
//             "medicines.$.dosage": req.body.dosage,
//             "medicines.$.time": req.body.time
//           }
//         },
//         { new: true }
//       );
  
//       if (!box) {
//         return res.status(404).json({ message: 'Medicine not found' });
//       }
  
//       res.json(box);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };
module.exports={boxes,addMedicineToBox,deleteMedicineFromBox,updateMedicineInBox};
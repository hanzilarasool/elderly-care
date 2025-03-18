const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Adjusted path to match your structure
const { restrictTo } = require('../middleware/restrictTo'); // Add this import

// const controller = require('../controllers/user-controller');
// console.log('Controller exports:', controller);
const {
  register,
  verifyOTP,
  login,
  getMe,
  updateMe,
  deleteUser,
  assignPatientToDoctor,
  logout,
  updatePatientMedicalHistory,
  getAllUsers,
  getDoctorAlerts,
   getPatientAlerts,
    dismissAlert,
} = require('../controllers/user-controller'); 

// Public Routes
router.post('/register', register);           // Register a new user and send OTP
router.post('/verify-otp', verifyOTP);        // Verify OTP and complete registration
router.post('/login', login);                 // Login user and return JWT token

// Protected Routes (require authentication)
router.get('/me', protect, getMe);            // Get current user's profile
router.patch('/me', protect, updateMe);       // Update current user's profile (e.g., name, specialization)
router.post('/logout', protect, logout);      // Logout user (clear token on client-side)

// Patient Medical History (accessible by doctors/admins)
router.post('/patient/medical-history', protect, updatePatientMedicalHistory); // Update patient's medical history


// doctor alert routes
router.get('/alerts', protect, getDoctorAlerts);

router.get('/patient/alerts', protect, getPatientAlerts); // Get alerts
router.post('/patient/dismiss-alert', protect, dismissAlert); // Dismiss alert
// Admin-Only Routes
router.get('/all', protect, restrictTo('admin'), getAllUsers); 
router.delete('/user/:id', protect, restrictTo('admin'), deleteUser); // Delete a user
router.post('/assign-patient', protect, restrictTo('admin'), assignPatientToDoctor); // Assign patient to doctor

module.exports = router;
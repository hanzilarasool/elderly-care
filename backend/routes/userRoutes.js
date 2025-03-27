const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/restrictTo');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const {
  register,
  verifyOTP,
  login,
  getMe,
  updateMe,
  uploadProfileImage,
  uploadDocument,
  deleteUser,
  assignPatientToDoctor,
  logout,
  updatePatientMedicalHistory,
  getAllUsers,
  getDoctorAlerts,
  getPatientAlerts,
  dismissAlert,
  updatePatientProfile,
  unassignPatientFromDoctor,
} = require('../controllers/user-controller');

// Public Routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

// Protected Routes
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.post('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);
router.post('/upload-document', protect, upload.single('document'), uploadDocument);
router.post('/logout', protect, logout);

// Patient Routes
router.post('/patient/medical-history', protect, updatePatientMedicalHistory);
router.post('/patient/update-profile', protect, updatePatientProfile);

// Doctor Alert Routes
router.get('/alerts', protect, getDoctorAlerts);
router.get('/patient/alerts', protect, getPatientAlerts);
router.post('/patient/dismiss-alert', protect, dismissAlert);

// Admin-Only Routes
router.get('/all', protect, restrictTo('admin'), getAllUsers);
router.delete('/user/:id', protect, restrictTo('admin'), deleteUser);
router.post('/assign-patient', protect, restrictTo('admin'), assignPatientToDoctor);
router.post('/unassign-patient', protect, restrictTo('admin'), unassignPatientFromDoctor);

module.exports = router;
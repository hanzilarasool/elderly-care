// backend/controllers/user-controller.js
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Helper: Generate JWT Token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// In-memory OTP store (use Redis or MongoDB in production)
const otpStore = {};

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Elderly Care Registration",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (err) {
    console.error("Error sending OTP email:", err);
    throw err;
  }
};

// Register User (Step 1: Send OTP)
const register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, age, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };
    await sendOTPEmail(email, otp);

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email. Please verify to complete registration.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

// Verify OTP and Complete Registration (Step 2)
const verifyOTP = async (req, res) => {
  try {
    const { name, email, password, role, specialization, age, gender, otp } = req.body;

    const storedOTP = otpStore[email];
    if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role, specialization, age, gender });
    user.password = undefined;

    delete otpStore[email];

    res.status(201).json({
      status: "success",
      message: "Registration successful! Please login",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        error: "Incorrect email or password",
      });
    }

    const token = signToken(user._id, user.role);

    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        gender: user.gender,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

// Get Current User Profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('patients');

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

// Update User Profile
const updateMe = async (req, res) => {
  try {
    const filteredBody = {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
      gender: req.body.gender,
      profileImage: req.body.profileImage,
    };

    if (req.body.password) {
      filteredBody.password = await bcrypt.hash(req.body.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

// Upload Profile Image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    user.profileImage = filePath;
    await user.save();

    console.log(`Profile image uploaded for user ${req.user.id}: ${filePath}`);

    res.status(200).json({
      status: 'success',
      profileImage: filePath,
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
};

// Delete User (Admin Only)
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

// Assign Patient to Doctor (Admin Only)
const assignPatientToDoctor = async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({
        status: "fail",
        error: "Doctor not found",
      });
    }

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({
        status: "fail",
        error: "Patient not found",
      });
    }

    if (!doctor.patients.includes(patientId)) {
      doctor.patients.push(patientId);
      await doctor.save();
    }

    patient.doctor = doctorId;
    await patient.save();

    res.status(200).json({
      status: "success",
      message: "Patient assigned to doctor successfully",
      doctor,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

// Logout User
const logout = (req, res) => {
  res.status(200).json({
    status: "success",
    token: "",
    message: "Logged out successfully",
  });
};

// Update Patient Medical History
const updatePatientMedicalHistory = async (req, res) => {
  try {
    const { patientId, vitals, diseases, notes, status } = req.body;

    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only doctors or admins can update medical history' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (req.user.role === 'doctor' && patient.doctor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: You are not assigned to this patient' });
    }

    const validStatuses = ['Normal', 'High', 'Low', 'OK', 'Danger'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Construct the new history entry with structured vitals and diseases
    const newHistory = {
      date: new Date(),
      vitals: vitals ? vitals.map(v => ({
        name: v.name,
        value: v.value,
        status: v.status || 'Normal',
        document: v.document || null // Document path if provided
      })) : [],
      diseases: diseases ? diseases.map(d => ({
        name: d.name,
        document: d.document || null // Document path if provided
      })) : [],
      notes: notes || '',
      documents: [], // Additional documents not tied to vitals/diseases
      status: status || 'Normal',
    };

    patient.medicalHistory.unshift(newHistory); // Add to the beginning
    await patient.save();

    res.status(200).json({
      status: 'success',
      message: 'Medical history updated successfully',
      medicalHistory: patient.medicalHistory,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
};

// Upload Document (Updated to associate with specific vital or disease)
const uploadDocument = async (req, res) => {
  try {
    const { patientId, historyId, vitalIndex, diseaseIndex } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Unauthorized: Only doctors can upload documents' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (patient.doctor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: You are not assigned to this patient' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const historyEntry = patient.medicalHistory.id(historyId);
    if (!historyEntry) {
      return res.status(404).json({ error: 'Medical history entry not found' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    // Associate document with specific vital or disease if provided
    if (vitalIndex !== undefined) {
      if (!historyEntry.vitals[vitalIndex]) {
        return res.status(400).json({ error: 'Invalid vital index' });
      }
      historyEntry.vitals[vitalIndex].document = filePath;
    } else if (diseaseIndex !== undefined) {
      if (!historyEntry.diseases[diseaseIndex]) {
        return res.status(400).json({ error: 'Invalid disease index' });
      }
      historyEntry.diseases[diseaseIndex].document = filePath;
    } else {
      // If no specific vital or disease is specified, add to general documents
      historyEntry.documents.push(filePath);
    }

    await patient.save();

    res.status(200).json({
      status: 'success',
      document: filePath,
      historyId,
      vitalIndex,
      diseaseIndex
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
};

// Get All Users (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only admins can access this route' });
    }

    const users = await User.find()
      .select('-password')
      .populate('doctor', 'name')
      .populate('patients', 'name');

    res.status(200).json({
      status: 'success',
      users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
};

// Get Doctor Alerts (Updated for new vital status)
const getDoctorAlerts = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Unauthorized: Only doctors can view alerts' });
    }
    const patients = await User.find({ doctor: req.user.id });
    const alerts = [];
    patients.forEach(patient => {
      if (!patient.doctor) {
        alerts.push({ patientId: patient._id, message: 'Unassigned patient', severity: 'high' });
      }
      patient.medicalHistory.forEach(history => {
        history.vitals.forEach(vital => {
          if (vital.status === 'High' || vital.status === 'Low' || vital.status === 'Danger') {
            alerts.push({
              patientId: patient._id,
              message: `Abnormal vital ${vital.name}: ${vital.status}`,
              severity: vital.status === 'Danger' ? 'critical' : 'high',
            });
          }
        });
      });
    });
    res.status(200).json({ status: 'success', alerts });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};

// Get Patient Alerts
const getPatientAlerts = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Unauthorized: Only doctors can view alerts' });
    }
    const doctor = await User.findById(req.user.id).populate('patients', 'name alerts');
    const alerts = doctor.patients.flatMap(patient => 
      patient.alerts.filter(alert => !alert.dismissed).map(alert => ({
        _id: alert._id,
        patientId: patient._id,
        patientName: patient.name,
        message: alert.message,
        date: alert.date,
      }))
    );
    res.status(200).json({ status: 'success', alerts });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};

// Dismiss Alert
const dismissAlert = async (req, res) => {
  try {
    const { patientId, alertId } = req.body;
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Unauthorized: Only doctors can dismiss alerts' });
    }
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const alert = patient.alerts.id(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    alert.dismissed = true;
    await patient.save();
    res.status(200).json({ status: 'success', message: 'Alert dismissed' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
};

// Update Patient Profile (No changes needed here for document functionality)
const updatePatientProfile = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Only doctors or admins can update patient profiles' });
    }

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (req.user.role === 'doctor' && patient.doctor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized: You are not assigned to this patient' });
    }

    if (req.user.role === 'doctor') {
      return res.status(403).json({ 
        error: 'Doctors can only update medical history, not personal information' 
      });
    }

    patient.name = req.body.name || patient.name;
    patient.age = req.body.age || patient.age;
    patient.gender = req.body.gender || patient.gender;
    await patient.save();

    res.status(200).json({
      status: 'success',
      message: 'Patient profile updated successfully',
      patient,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
};

// Unassign Patient from Doctor (Admin Only)
const unassignPatientFromDoctor = async (req, res) => {
  try {
    const { patientId } = req.body;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        status: 'fail',
        error: 'Patient not found',
      });
    }

    if (!patient.doctor) {
      return res.status(400).json({
        status: 'fail',
        error: 'Patient is not assigned to any doctor',
      });
    }

    const doctor = await User.findById(patient.doctor);
    if (doctor) {
      doctor.patients = doctor.patients.filter(p => p.toString() !== patientId);
      await doctor.save();
    }

    patient.doctor = null;
    await patient.save();

    res.status(200).json({
      status: 'success',
      message: 'Patient unassigned successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
};

module.exports = {
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
};
// controllers/userController.js
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
// Helper: Generate JWT Token
const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, role,specialization } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role,specialization });
    user.password = undefined; // Remove password from output

    res.status(201).json({
      status: "success",
      message: "Registration successful! Please login",
      user
    });
    
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      error: error.message 
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        error: "Please provide email and password"
      });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        error: "Incorrect email or password"
      });
    }

    // 3) Generate JWT Token
    const token = signToken(user._id, user.role);
    
    // 4) Send response with token
    res.status(200).json({
      status: "success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ 
      status: "error",
      error: error.message 
    });
  }
};

// Get Current User Profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: "success",
      user
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      error: error.message 
    });
  }
};

// Update User Profile
const updateMe = async (req, res) => {
  try {
    // 1) Filter allowed fields
    const filteredBody = {
      name: req.body.name,
      email: req.body.email
    };

    // 2) If password update requested
    if (req.body.password) {
      filteredBody.password = await bcrypt.hash(req.body.password, 12);
    }

    // 3) Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ 
      status: "error",
      error: error.message 
    });
  }
};

// Delete User (Admin Only)
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      error: error.message 
    });
  }
};

// Assign Patient to Doctor (Admin Only)
const assignPatientToDoctor = async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    // 1) Check if both users exist
    const doctor = await User.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({
        status: "fail",
        error: "Doctor not found"
      });
    }

    if (!patient || patient.role !== "patient") {
      return res.status(404).json({
        status: "fail",
        error: "Patient not found"
      });
    }

    // 2) Update doctor's patients and patient's doctor
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
      patient
    });

  } catch (error) {
    res.status(500).json({ 
      status: "error",
      error: error.message 
    });
  }
};

// Logout User (Token Invalidation)
const logout = (req, res) => {
  res.status(200).json({
    status: "success",
    token: "",
    message: "Logged out successfully"
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  deleteUser,
  assignPatientToDoctor,
  logout
};
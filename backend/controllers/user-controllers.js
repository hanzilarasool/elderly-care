
// controllers/userController.js
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

// Nodemailer configuration (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
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
    const { name, email, password, role, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate and store OTP
    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // 10-minute expiry

    // Send OTP email
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
    const { name, email, password, role, specialization, otp } = req.body;

    // Validate OTP
    const storedOTP = otpStore[email];
    if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role, specialization });
    user.password = undefined; // Remove password from output

    // Clear OTP from store
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
    const user = await User.findById(req.user.id);

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

module.exports = {
  register,
  verifyOTP,
  login,
  getMe,
  updateMe,
  deleteUser,
  assignPatientToDoctor,
  logout,
};
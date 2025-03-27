const Fall = require("../models/fall-model");
const User = require("../models/user-model");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Email Config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendFallAlertToDoctor = async (doctorEmail, patientName, location) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: doctorEmail,
    subject: "⚠️ Fall Detected for Your Patient!",
    text: `Emergency! A fall has been detected for patient ${patientName} at location: ${location}. Please check immediately!`,
  });
};

const detectFall = async (req, res) => {
    try {
      const { email, location, doctorId } = req.body;
      const userId = req.user.id;
  
      console.log("Request body:", req.body); // Debug: Log incoming request body
      console.log("Authenticated user ID (patient):", userId); // Debug: Log patient ID from token
  
      // Save fall event to MongoDB
      const fall = new Fall({ userId, email, location, doctorId });
      await fall.save();
  
      // Find the patient and their assigned doctor
      const patient = await User.findById(userId);
      console.log("Patient found:", patient); // Debug: Log patient document
  
      const doctor = await User.findById(doctorId);
      console.log("Doctor found:", doctor); // Debug: Log doctor document
  
      if (!patient || !doctor) {
        return res.status(404).json({ error: "Patient or Doctor not found" });
      }
  
      // Update doctor's alerts
      const alertMessage = `Fall detected for ${patient.name} at ${location}`;
      await User.updateOne(
        { _id: doctorId },
        {
          $push: {
            alerts: {
              message: alertMessage,
              relatedPatient: userId,
            },
          },
        }
      );
  
      // Update patient's last known location
      await User.updateOne({ _id: userId }, { lastKnownLocation: location });
  
      // Send email alert to the assigned doctor
      await sendFallAlertToDoctor(doctor.email, patient.name, location);
  
      res.status(200).json({ message: "Fall detected & alert sent to doctor!" });
    } catch (error) {
      console.error("Error in detectFall:", error);
      res.status(500).json({ error: error.message });
    }
  };
const getDoctorFalls = async (req, res) => {
  try {
    console.log("req.user:", req.user); // Debug: Log the entire req.user object
    const doctorId = req.user.id; // Changed from req.user._id to req.user.id
    console.log("Fetching doctor with ID:", doctorId); // Debug: Log the doctorId

    const doctor = await User.findById(doctorId).populate("alerts.relatedPatient", "name email");
    if (!doctor) {
      console.log("Doctor not found for ID:", doctorId); // Debug: Log if doctor is not found
      return res.status(404).json({ error: "Doctor not found" });
    }

    console.log("Doctor found:", doctor); // Debug: Log the doctor object
    const fallAlerts = doctor.alerts.filter(alert => alert.message.includes("Fall detected"));
    console.log("Filtered fall alerts:", fallAlerts); // Debug: Log the filtered alerts

    res.status(200).json({ falls: fallAlerts });
  } catch (error) {
    console.error("Error in getDoctorFalls:", error);
    res.status(500).json({ error: error.message });
  }
};
const clearFallAlert = async (req, res) => {
    try {
      const doctorId = req.user.id;
      const alertId = req.params.alertId;
  
      const doctor = await User.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
  
      const alertExists = doctor.alerts.some((alert) => alert._id.toString() === alertId);
      if (!alertExists) {
        return res.status(404).json({ error: "Alert not found" });
      }
  
      await User.updateOne(
        { _id: doctorId },
        { $pull: { alerts: { _id: alertId } } }
      );
  
      res.status(200).json({ message: "Alert cleared successfully" });
    } catch (error) {
      console.error("Error in clearFallAlert:", error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const clearAllFallAlerts = async (req, res) => {
    try {
      const doctorId = req.user.id;
  
      const doctor = await User.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
  
      await User.updateOne(
        { _id: doctorId },
        { $set: { alerts: [] } }
      );
  
      res.status(200).json({ message: "All alerts cleared successfully" });
    } catch (error) {
      console.error("Error in clearAllFallAlerts:", error);
      res.status(500).json({ error: error.message });
    }
  };
module.exports = { detectFall, getDoctorFalls,clearFallAlert, clearAllFallAlerts };
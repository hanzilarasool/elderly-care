const mongoose = require("mongoose");

const FallSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to doctor
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Fall", FallSchema);
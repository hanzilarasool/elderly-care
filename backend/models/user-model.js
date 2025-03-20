// backend/models/user-model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['doctor', 'patient', 'admin'],
    required: true
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'Other'],
  },
  profileImage: {
    type: String, // Store the URL/path of the uploaded image
  },
  // Doctor-specific fields
  specialization: {
    type: String,
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Patient-specific fields
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  medicalHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    vitals: {
      type: Map, // Use Map to store dynamic key-value pairs (e.g., { "blood pressure": "120/80" })
      of: String,
    },
    diseases: [String],
    notes: String,
    documents: [String], // Store URLs/paths of uploaded documents
    status: { // Add status field
      type: String,
      enum: ['Normal', 'High', 'Low', 'OK', 'Danger'],
      default: 'Normal'
    }
  }],
  alerts: [{
    message: String,
    date: { type: Date, default: Date.now },
    dismissed: { type: Boolean, default: false },
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
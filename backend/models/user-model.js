// models/User.js
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
    // required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['doctor', 'patient', 'admin'],
    required: true
  },
  // Doctor-specific fields
  specialization: {
    type: String,
    // required: function() { return this.role === 'doctor'; }
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Patient-specific fields
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: function() { return this.role === 'patient'; }
  },
  medicalHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      oxygenLevel: Number
    },
    diseases: [String],
    notes: String
  }],
  // Admin-specific fields (can be extended)
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
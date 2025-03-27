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
    type: String,
  },
  specialization: {
    type: String,
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  medicalHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    vitals: [{
      name: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      document: {
        type: String,
      },
      status: {
        type: String,
        enum: ['Normal', 'High', 'Low', 'OK', 'Danger'],
        default: 'Normal'
      }
    }],
    diseases: [{
      name: {
        type: String,
      },
      document: {
        type: String,
      }
    }],
    notes: String,
    documents: [String],
    status: {
      type: String,
      enum: ['Normal', 'High', 'Low', 'OK', 'Danger'],
      default: 'Normal'
    }
  }],
  alerts: [{
    message: String,
    date: { type: Date, default: Date.now },
    dismissed: { type: Boolean, default: false },
    relatedPatient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  lastKnownLocation: {
    type: String,
    default: 'Unknown'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
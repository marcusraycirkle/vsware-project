const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  pin: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Principal', 'Teacher', 'Parent', 'Student', 'Secretary'],
    required: true
  },
  name: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  // Role hierarchy for teachers: Avg, Mid, High, HR
  roleHierarchy: {
    type: String,
    enum: ['Avg', 'Mid', 'High', 'HR', 'Principal', 'Secretary', 'Parent', 'Student'],
    default: null
  },
  permissionLevel: {
    type: String,
    default: 'General'
  },
  department: {
    type: String,
    default: null
  },
  designation: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  profileImage: {
    type: String,
    default: ''
  },
  photoUrl: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  address: {
    street: String,
    city: String,
    county: String,
    postcode: String,
    country: { type: String, default: 'Ireland' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Reference to specific role profile
  studentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  teacherProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  parentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  },
  notifications: [{
    message: String,
    type: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  settings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    theme: { type: String, default: 'light' }
  }
}, {
  timestamps: true
});

// Hash password and PIN before saving
userSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    if (this.isModified('pin')) {
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(this.pin, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare PINs
userSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);

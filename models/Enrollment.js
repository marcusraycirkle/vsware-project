const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  pps: {
    type: String
  },

  // Address Information
  address: {
    street: String,
    city: String,
    county: String,
    eircode: String
  },

  // Academic Information
  yearGroup: {
    type: Number,
    default: 1 // First year admission
  },
  previousSchool: {
    name: String,
    address: String,
    rollNumber: String,
    lastYear: Number
  },

  // Medical Information
  medicalInfo: {
    bloodGroup: String,
    allergies: [String],
    conditions: [String],
    medications: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },

  // Additional Information
  notes: String,

  // Enrollment Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined'],
    default: 'Pending'
  },

  // Approval/Decline Information
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  declineReason: String,
  declinedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  declineDate: Date,

  // Link to Student Profile (if approved and student created)
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },

  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
enrollmentSchema.index({ status: 1, submittedAt: -1 });
enrollmentSchema.index({ email: 1 });
enrollmentSchema.index({ firstName: 'text', lastName: 'text' });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

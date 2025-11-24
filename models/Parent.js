const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: String,
    required: true,
    unique: true
  },
  relationship: {
    type: String,
    enum: ['Father', 'Mother', 'Guardian', 'Other'],
    required: true
  },
  occupation: {
    type: String
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  }],
  alternateEmail: {
    type: String,
    lowercase: true
  },
  alternatePhone: {
    type: String
  },
  workPhone: {
    type: String
  },
  canPickup: {
    type: Boolean,
    default: true
  },
  isPrimaryContact: {
    type: Boolean,
    default: false
  },
  emergencyContact: {
    type: Boolean,
    default: true
  },
  notifications: {
    receiveAttendanceAlerts: { type: Boolean, default: true },
    receiveBehaviorAlerts: { type: Boolean, default: true },
    receiveAssessmentReports: { type: Boolean, default: true },
    receivePaymentReminders: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Parent', parentSchema);

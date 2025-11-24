const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Excused', 'Half Day'],
    required: true
  },
  period: {
    type: Number
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  reason: {
    type: String
  },
  parentNotified: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },
  arrivalTime: {
    type: String
  },
  departureTime: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ class: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

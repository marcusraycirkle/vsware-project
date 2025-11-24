const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  period: Number,
  purpose: {
    type: String,
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  expectedAttendees: Number,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recurringBooking: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
    },
    endDate: Date
  },
  notes: String,
  equipmentNeeded: [String],
  setupRequired: String
}, {
  timestamps: true
});

// Index for efficient booking queries
roomBookingSchema.index({ room: 1, date: 1 });
roomBookingSchema.index({ bookedBy: 1, date: 1 });

module.exports = mongoose.model('RoomBooking', roomBookingSchema);

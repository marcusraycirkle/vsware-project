const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'IT Rooms',
      'Home Economics Rooms',
      'Science Labs',
      'Art Rooms',
      'General Classrooms',
      'Lecture Theatre',
      'Music Rooms',
      'Woodwork/Metalwork',
      'PE/Sports Hall',
      'Staff Rooms',
      'Administration',
      'Library',
      'Canteen',
      'Other'
    ]
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    default: 30
  },
  equipment: [{
    name: String,
    quantity: Number
  }],
  features: [String], // e.g., ['Smartboard', 'Projector', 'Air Conditioning']
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    building: String,
    wing: String,
    coordinates: {
      x: Number,
      y: Number
    }
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomBooking'
  }],
  regularClasses: [{
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    period: Number,
    startTime: String,
    endTime: String
  }],
  maintenanceSchedule: [{
    date: Date,
    description: String,
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Scheduled'
    }
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);

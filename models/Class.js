const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  yearGroup: {
    type: String,
    enum: ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'],
    required: true
  },
  section: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  teachers: [{
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  capacity: {
    type: Number,
    default: 30
  },
  room: {
    type: String
  },
  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Virtual for current enrollment
classSchema.virtual('currentEnrollment').get(function() {
  return this.students.length;
});

// Virtual for available seats
classSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.students.length;
});

module.exports = mongoose.model('Class', classSchema);

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true
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
  admissionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  currentYear: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  yearName: {
    type: String,
    enum: ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'],
    required: true
  },
  house: {
    type: String,
    enum: ['Bride', 'Ide', 'Tola', 'Seanan', 'Padraig', 'Conaire'],
    required: true
  },
  lockerNumber: {
    type: String
  },
  pps: {
    type: String
  },
  vswareId: {
    type: String,
    unique: true
  },
  yearGroup: {
    type: String,
    enum: ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'],
    required: true
  },
  house: {
    type: String,
    enum: ['Bride', 'Ide', 'Tola', 'Seanan', 'Padraig', 'Conaire'],
    required: true
  },
  currentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  parents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  }],
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
  attendance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }],
  behavior: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Behavior'
  }],
  assessments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  fees: {
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Transferred', 'Expelled'],
    default: 'Active'
  },
  previousSchool: {
    name: String,
    address: String,
    lastYear: Number
  },
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Virtual for age
studentSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

module.exports = mongoose.model('Student', studentSchema);

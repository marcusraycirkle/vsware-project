const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
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
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  qualification: {
    degree: String,
    university: String,
    year: Number,
    specialization: String
  },
  experience: {
    years: Number,
    previousSchools: [{
      name: String,
      duration: String,
      position: String
    }]
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  classTeacherOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  salary: {
    basicSalary: Number,
    allowances: Number,
    deductions: Number,
    totalSalary: Number
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    iban: String,
    bic: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Resigned', 'Terminated'],
    default: 'Active'
  },
  parkingSpot: {
    type: String,
    default: ''
  },
  permissionLevel: {
    type: String,
    enum: ['Admin', 'Editor', 'General'],
    default: 'General',
    required: true
  },
  permissions: {
    // Admin: Full access to everything
    canManageUsers: { type: Boolean, default: false },
    canManageTeachers: { type: Boolean, default: false },
    canManageStudents: { type: Boolean, default: false },
    canManageClasses: { type: Boolean, default: false },
    canEditTimetable: { type: Boolean, default: false },
    canViewAllReports: { type: Boolean, default: false },
    canManagePayments: { type: Boolean, default: false },
    canManageRooms: { type: Boolean, default: false },
    // Editor: Can edit student timetables and certain info
    canEditStudentInfo: { type: Boolean, default: false },
    canEditStudentTimetable: { type: Boolean, default: false },
    // General: Normal teacher stuff + send mail
    canViewReports: { type: Boolean, default: true },
    canManageAttendance: { type: Boolean, default: true },
    canManageBehavior: { type: Boolean, default: true },
    canManageAssessments: { type: Boolean, default: true },
    canSendMail: { type: Boolean, default: true },
    canBookRooms: { type: Boolean, default: true }
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

module.exports = mongoose.model('Teacher', teacherSchema);

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  years: [{
    type: Number,
    min: 1,
    max: 6
  }],
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  isCore: {
    type: Boolean,
    default: false
  },
  isElective: {
    type: Boolean,
    default: false
  },
  credits: {
    type: Number,
    default: 1
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  passingMarks: {
    type: Number,
    default: 40
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);

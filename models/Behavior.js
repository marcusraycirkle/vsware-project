const mongoose = require('mongoose');

const behaviorSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  type: {
    type: String,
    enum: ['Positive', 'Negative', 'Neutral'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'Academic Excellence',
      'Good Behavior',
      'Participation',
      'Leadership',
      'Sportsmanship',
      'Attendance',
      'Disruption',
      'Bullying',
      'Incomplete Work',
      'Disrespect',
      'Fighting',
      'Vandalism',
      'Cheating',
      'Late',
      'Uniform Violation',
      'Other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: Number
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionTaken: {
    type: String
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  parentNotified: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },
  parentAcknowledged: {
    type: Boolean,
    default: false
  },
  parentComments: {
    type: String
  },
  points: {
    type: Number,
    default: 0
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  }
}, {
  timestamps: true
});

// Index for faster queries
behaviorSchema.index({ student: 1, date: 1 });
behaviorSchema.index({ class: 1, date: 1 });

module.exports = mongoose.model('Behavior', behaviorSchema);

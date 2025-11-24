const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    archived: {
      type: Boolean,
      default: false
    },
    starred: {
      type: Boolean,
      default: false
    }
  }],
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Individual', 'Broadcast', 'Class', 'Year', 'All Parents', 'All Teachers', 'All Students'],
    default: 'Individual'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  category: {
    type: String,
    enum: ['General', 'Academic', 'Administrative', 'Event', 'Alert', 'Announcement'],
    default: 'General'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  relatedClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  relatedStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  sentAt: {
    type: Date,
    default: Date.now
  },
  scheduledFor: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Scheduled', 'Failed'],
    default: 'Sent'
  }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ sender: 1, sentAt: -1 });
messageSchema.index({ 'recipients.user': 1, sentAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

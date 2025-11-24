const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Tuition Fee', 'Exam Fee', 'Library Fee', 'Transport Fee', 'Activity Fee', 'Late Fee', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Online', 'Cheque']
  },
  transactionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3', 'Annual']
  },
  receiptNumber: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  notes: {
    type: String
  },
  reminders: [{
    sentAt: Date,
    method: String
  }],
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate remaining amount before saving
paymentSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = this.dueDate < new Date() ? 'Overdue' : 'Pending';
  } else if (this.paidAmount < this.totalAmount) {
    this.status = 'Partially Paid';
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  }
  
  next();
});

// Index for faster queries
paymentSchema.index({ student: 1, status: 1 });
paymentSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

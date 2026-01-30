const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

// @route   GET /api/payments
// @desc    Get payments
// @access  Private (Admin/Principal/Teacher/Parent)
router.get('/', auth, authorize('admin', 'principal', 'teacher', 'parent'), async (req, res) => {
  try {
    const {
      student, status, type, academicYear, term,
      page = 1, limit = 20
    } = req.query;
    
    let query = {};
    
    // Filter by role
    if (req.user.role === 'parent') {
      const Parent = require('../models/Parent');
      const parent = await Parent.findOne({ user: req.userId });
      query.student = { $in: parent.children };
    }
    
    if (student) query.student = student;
    if (status) query.status = status;
    if (type) query.type = type;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    
    const payments = await Payment.find(query)
      .populate('student', 'studentId user')
      .populate('parent', 'user relationship')
      .populate('processedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dueDate: -1 });
    
    const count = await Payment.countDocuments(query);
    
    res.json({
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private (Admin/Principal/Teacher/Parent)
router.get('/:id', auth, authorize('admin', 'principal', 'teacher', 'parent'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student')
      .populate('parent')
      .populate('processedBy');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check authorization for parents
    if (req.user.role === 'parent') {
      const Parent = require('../models/Parent');
      const parent = await Parent.findOne({ user: req.userId });
      if (!parent.children.includes(payment.student._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/payments
// @desc    Create new payment/invoice
// @access  Private (Admin/Principal)
router.post('/', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const {
      student, type, description, amount, tax, dueDate,
      academicYear, term, notes
    } = req.body;
    
    // Get student and parent
    const studentData = await Student.findById(student).populate('parents');
    
    if (!studentData) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const totalAmount = amount + (tax || 0);
    
    const payment = new Payment({
      student,
      parent: studentData.parents[0], // Primary parent
      invoiceNumber: `INV-${Date.now()}`,
      type,
      description,
      amount,
      tax: tax || 0,
      totalAmount,
      dueDate,
      academicYear,
      term,
      notes,
      processedBy: req.userId
    });
    
    await payment.save();
    
    // Update student fees
    studentData.fees.totalAmount += totalAmount;
    studentData.fees.pendingAmount += totalAmount;
    await studentData.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('student')
      .populate('parent');
    
    res.status(201).json({
      message: 'Payment invoice created successfully',
      payment: populatedPayment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/payments/:id/pay
// @desc    Process payment
// @access  Private
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Validate payment amount
    if (amount > payment.remainingAmount) {
      return res.status(400).json({ 
        message: 'Payment amount exceeds remaining balance',
        remaining: payment.remainingAmount
      });
    }
    
    payment.paidAmount += amount;
    payment.paymentDate = new Date();
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    payment.receiptNumber = `REC-${Date.now()}`;
    payment.processedBy = req.userId;
    
    await payment.save();
    
    // Update student fees
    const student = await Student.findById(payment.student);
    student.fees.paidAmount += amount;
    student.fees.pendingAmount -= amount;
    await student.save();
    
    res.json({
      message: 'Payment processed successfully',
      payment,
      receiptNumber: payment.receiptNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/payments/:id
// @desc    Update payment
// @access  Private (Admin/Principal)
router.put('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('student')
      .populate('parent');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/payments/student/:studentId/summary
// @desc    Get payment summary for a student
// @access  Private
router.get('/student/:studentId/summary', auth, async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    let query = { student: req.params.studentId };
    if (academicYear) query.academicYear = academicYear;
    
    const payments = await Payment.find(query);
    
    const totalAmount = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    const paidAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const pendingAmount = totalAmount - paidAmount;
    
    const byStatus = payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    const byType = payments.reduce((acc, p) => {
      if (!acc[p.type]) {
        acc[p.type] = { count: 0, total: 0, paid: 0 };
      }
      acc[p.type].count++;
      acc[p.type].total += p.totalAmount;
      acc[p.type].paid += p.paidAmount;
      return acc;
    }, {});
    
    res.json({
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
        byStatus,
        byType
      },
      payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/payments/reports/overdue
// @desc    Get overdue payments report
// @access  Private (Admin/Principal)
router.get('/reports/overdue', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const payments = await Payment.find({
      status: 'Overdue',
      remainingAmount: { $gt: 0 }
    })
      .populate('student', 'studentId user')
      .populate('parent', 'user relationship')
      .sort({ dueDate: 1 });
    
    const totalOverdue = payments.reduce((sum, p) => sum + p.remainingAmount, 0);
    
    res.json({
      payments,
      stats: {
        count: payments.length,
        totalOverdue
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/payments/:id/send-reminder
// @desc    Send payment reminder
// @access  Private (Admin/Principal)
router.post('/:id/send-reminder', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const { method } = req.body; // 'email' or 'sms'
    
    const payment = await Payment.findById(req.params.id)
      .populate('student')
      .populate('parent');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // TODO: Implement email/SMS sending
    payment.reminders.push({
      sentAt: new Date(),
      method
    });
    await payment.save();
    
    res.json({ message: 'Payment reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const https = require('https');
const url = require('url');
const { sendAcceptanceEmail, sendRejectionEmail } = require('../utils/emailService');
const { logEnrollmentToSheets, logStatusChangeToSheets } = require('../utils/googleSheetsService');

// @route   POST /api/enrollments
// @desc    Submit new enrollment (public)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender, pps,
      address, yearGroup, previousSchool, medicalInfo, notes
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, dateOfBirth, gender'
      });
    }

    // Check if email already has pending enrollment
    const existingEnrollment = await Enrollment.findOne({
      email: email.toLowerCase(),
      status: 'Pending'
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'An enrollment application is already pending for this email address'
      });
    }

    // Create enrollment record
    const enrollment = new Enrollment({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      dateOfBirth,
      gender,
      pps,
      address: address || {},
      yearGroup: yearGroup || 1,
      previousSchool: previousSchool || {},
      medicalInfo: medicalInfo || {},
      notes,
      status: 'Pending',
      submittedAt: new Date()
    });

    await enrollment.save();

    // Log to Google Sheets (if configured)
    try {
      await logEnrollmentToSheets(enrollment);
    } catch (sheetsError) {
      console.warn('Failed to log to Google Sheets:', sheetsError.message);
      // Don't fail the enrollment submission if Sheets logging fails
    }

    res.status(201).json({
      success: true,
      message: 'Enrollment submitted successfully. Your application is pending approval.',
      enrollmentId: enrollment._id
    });
  } catch (error) {
    console.error('Error submitting enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/enrollments
// @desc    Get all enrollments (staff only)
// @access  Private (Admin/Principal/Teacher)
router.get('/', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { status = 'Pending', page = 1, limit = 20, search } = req.query;

    let query = {};
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const enrollments = await Enrollment.find(query)
      .populate('approvedBy', 'firstName lastName email')
      .populate('declinedBy', 'firstName lastName email')
      .populate('student')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(query);

    res.json({
      success: true,
      enrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/enrollments/:id
// @desc    Get single enrollment
// @access  Private (Admin/Principal/Teacher)
router.get('/:id', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('approvedBy', 'firstName lastName email')
      .populate('declinedBy', 'firstName lastName email')
      .populate('student');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      enrollment
    });
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/enrollments/:id/approve
// @desc    Approve enrollment and create student
// @access  Private (Admin/Principal)
router.put('/:id/approve', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    console.log('=== APPROVAL START ===');
    console.log('Enrollment ID:', req.params.id);
    console.log('User ID:', req.userId);
    
    const enrollment = await Enrollment.findById(req.params.id);
    console.log('Enrollment found:', !!enrollment);
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (enrollment.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot approve: status is ${enrollment.status}` });
    }

    // Mark as approved (simple first)
    enrollment.status = 'Approved';
    enrollment.approvedBy = req.userId;
    enrollment.approvalDate = new Date();
    await enrollment.save();
    console.log('Enrollment marked as approved');

    res.json({
      success: true,
      message: 'Enrollment approved',
      enrollment
    });
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
});

// @route   PUT /api/enrollments/:id/decline
// @desc    Decline enrollment
// @access  Private (Admin/Principal)
router.put('/:id/decline', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Decline reason is required'
      });
    }

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot decline enrollment with status: ${enrollment.status}`
      });
    }

    // Update enrollment
    enrollment.status = 'Declined';
    enrollment.declineReason = reason;
    enrollment.declinedBy = req.userId;
    enrollment.declineDate = new Date();
    await enrollment.save();

    // Log decline to Google Sheets (disabled temporarily - webhook not working)
    // logStatusChangeToSheets(enrollment, 'decline', { reason }).catch(err => {
    //   console.warn('Failed to log to Google Sheets:', err.message);
    // });

    // Send rejection email
    sendRejectionEmail(enrollment.email, enrollment.firstName, reason).catch(err => {
      console.warn('Failed to send email:', err.message);
    });

    res.json({
      success: true,
      message: 'Enrollment declined',
      enrollment
    });
  } catch (error) {
    console.error('Error declining enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/enrollments/stats/summary
// @desc    Get enrollment statistics
// @access  Private (Admin/Principal/Teacher)
router.get('/stats/summary', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const total = await Enrollment.countDocuments();
    const pending = await Enrollment.countDocuments({ status: 'Pending' });
    const approved = await Enrollment.countDocuments({ status: 'Approved' });
    const declined = await Enrollment.countDocuments({ status: 'Declined' });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        declined
      }
    });
  } catch (error) {
    console.error('Error fetching enrollment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function to log enrollment to Excel
module.exports = router;

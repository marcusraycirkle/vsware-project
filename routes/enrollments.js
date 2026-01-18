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
        message: `Cannot approve enrollment with status: ${enrollment.status}`
      });
    }

    // Check if student user already exists
    let user = await User.findOne({ email: enrollment.email });

    if (!user) {
      // Create user account
      const defaultPassword = `Student${Date.now()}`;
      user = new User({
        email: enrollment.email,
        password: defaultPassword,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        role: 'student',
        phoneNumber: enrollment.phone,
        address: enrollment.address || {}
      });
      await user.save();
    }

    // Create student profile
    const yearNames = ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'];
    const yearName = yearNames[(enrollment.yearGroup || 1) - 1] || 'First Year';

    const student = new Student({
      user: user._id,
      studentId: `SPC${Date.now().toString().slice(-6)}`,
      admissionNumber: `ADM${Date.now().toString().slice(-8)}`,
      dateOfBirth: enrollment.dateOfBirth,
      gender: enrollment.gender,
      currentYear: enrollment.yearGroup || 1,
      yearGroup: yearName,
      yearName: yearName,
      house: 'Bride',
      admissionDate: new Date(),
      status: 'Active',
      pps: enrollment.pps,
      medicalInfo: enrollment.medicalInfo,
      previousSchool: enrollment.previousSchool || {},
      notes: enrollment.notes ? [{ content: enrollment.notes, createdBy: req.userId, createdAt: new Date() }] : []
    });

    await student.save();

    // Link student to user
    user.studentProfile = student._id;
    await user.save();

    // Update enrollment
    enrollment.status = 'Approved';
    enrollment.approvedBy = req.userId;
    enrollment.approvalDate = new Date();
    enrollment.student = student._id;
    await enrollment.save();

    // Log approval to Google Sheets (non-blocking)
    logStatusChangeToSheets(enrollment, 'approve').catch(err => {
      console.warn('Failed to log to Google Sheets:', err.message);
    });

    // Send acceptance email (non-blocking)
    sendAcceptanceEmail(enrollment.email, enrollment.firstName, enrollment.yearGroup).catch(err => {
      console.warn('Failed to send email:', err.message);
    });

    res.json({
      success: true,
      message: 'Enrollment approved and student profile created',
      enrollment,
      student
    });
  } catch (error) {
    console.error('Error approving enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving enrollment',
      error: error.message
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

    // Log decline to Google Sheets (non-blocking)
    logStatusChangeToSheets(enrollment, 'decline', { reason }).catch(err => {
      console.warn('Failed to log to Google Sheets:', err.message);
    });

    // Send rejection email (non-blocking)
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

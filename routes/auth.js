const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const { auth } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (Admin only in production)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['admin', 'principal', 'secretary', 'teacher', 'parent', 'student'])
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, firstName, lastName, role, ...profileData } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber: profileData.phoneNumber,
      address: profileData.address
    });
    
    await user.save();
    
    // Create role-specific profile
    let profile;
    if (role === 'student') {
      profile = new Student({
        user: user._id,
        studentId: profileData.studentId || `STD${Date.now()}`,
        admissionNumber: profileData.admissionNumber || `ADM${Date.now()}`,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        currentYear: profileData.currentYear,
        admissionDate: profileData.admissionDate || new Date()
      });
      await profile.save();
      user.studentProfile = profile._id;
    } else if (role === 'teacher') {
      profile = new Teacher({
        user: user._id,
        teacherId: profileData.teacherId || `TCH${Date.now()}`,
        employeeId: profileData.employeeId || `EMP${Date.now()}`,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        department: profileData.department,
        designation: profileData.designation,
        joiningDate: profileData.joiningDate || new Date()
      });
      await profile.save();
      user.teacherProfile = profile._id;
    } else if (role === 'parent') {
      profile = new Parent({
        user: user._id,
        parentId: profileData.parentId || `PAR${Date.now()}`,
        relationship: profileData.relationship,
        children: profileData.children || []
      });
      await profile.save();
      user.parentProfile = profile._id;
    }
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileId: profile?._id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user with email and password
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive. Please contact administrator.' });
    }
    
    // Verify password
    const isMatch = await user.comparePin(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Get profile data based on role
    let profile = null;
    if (user.role === 'student' && user.studentProfile) {
      profile = await Student.findById(user.studentProfile)
        .populate('currentClass')
        .populate('parents');
    } else if (user.role === 'teacher' && user.teacherProfile) {
      profile = await Teacher.findById(user.teacherProfile)
        .populate('subjects')
        .populate('classes');
    } else if (user.role === 'parent' && user.parentProfile) {
      profile = await Parent.findById(user.parentProfile)
        .populate('children');
    }
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        profileImage: user.profileImage,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get profile data based on role
    let profile = null;
    if (user.role === 'student' && user.studentProfile) {
      profile = await Student.findById(user.studentProfile)
        .populate('currentClass')
        .populate('parents')
        .populate('subjects');
    } else if (user.role === 'teacher' && user.teacherProfile) {
      profile = await Teacher.findById(user.teacherProfile)
        .populate('subjects')
        .populate('classes')
        .populate('classTeacherOf');
    } else if (user.role === 'parent' && user.parentProfile) {
      profile = await Parent.findById(user.parentProfile)
        .populate({
          path: 'children',
          populate: { path: 'currentClass' }
        });
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        settings: user.settings,
        notifications: user.notifications,
        lastLogin: user.lastLogin,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/change-pin
// @desc    Change user PIN
// @access  Private
router.post('/change-pin', auth, [
  body('currentPin').isLength({ min: 4, max: 6 }),
  body('newPin').isLength({ min: 4, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPin, newPin } = req.body;
    
    const user = await User.findById(req.userId);
    
    // Verify current PIN
    const isMatch = await user.comparePin(currentPin);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current PIN is incorrect' });
    }
    
    // Update PIN
    user.pin = newPin;
    await user.save();
    
    res.json({ message: 'PIN changed successfully' });
  } catch (error) {
    console.error('Change PIN error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    
    // TODO: Implement email sending with reset token
    // For now, just return success
    res.json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

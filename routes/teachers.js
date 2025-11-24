const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { department, status, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    
    const teachers = await Teacher.find(query)
      .populate('user', '-password')
      .populate('subjects')
      .populate('classes')
      .populate('classTeacherOf')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    let filteredTeachers = teachers;
    if (search) {
      filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`.toLowerCase();
        return fullName.includes(search.toLowerCase()) ||
               teacher.teacherId.toLowerCase().includes(search.toLowerCase()) ||
               teacher.employeeId.toLowerCase().includes(search.toLowerCase());
      });
    }
    
    const count = await Teacher.countDocuments(query);
    
    res.json({
      teachers: filteredTeachers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', '-password')
      .populate('subjects')
      .populate('classes')
      .populate('classTeacherOf')
      .populate('timetable');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin/Principal)
router.post('/', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, phoneNumber, address,
      teacherId, employeeId, dateOfBirth, gender, department,
      designation, qualification, experience, subjects
    } = req.body;
    
    // Create user account
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'teacher',
      phoneNumber,
      address
    });
    await user.save();
    
    // Create teacher profile
    const teacher = new Teacher({
      user: user._id,
      teacherId: teacherId || `TCH${Date.now()}`,
      employeeId: employeeId || `EMP${Date.now()}`,
      dateOfBirth,
      gender,
      department,
      designation,
      qualification,
      experience,
      subjects
    });
    await teacher.save();
    
    // Link teacher to user
    user.teacherProfile = teacher._id;
    await user.save();
    
    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('user', '-password')
      .populate('subjects');
    
    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: populatedTeacher
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin/Principal)
router.put('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('user', '-password')
      .populate('subjects')
      .populate('classes');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Delete associated user account
    await User.findByIdAndDelete(teacher.user);
    
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teachers/:id/dashboard
// @desc    Get teacher dashboard data
// @access  Private (Teacher)
router.get('/:id/dashboard', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', '-password')
      .populate('subjects')
      .populate('classes')
      .populate('classTeacherOf')
      .populate('timetable');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Get today's classes
    const Class = require('../models/Class');
    const todaysClasses = await Class.find({ 
      'teachers.teacher': teacher._id 
    })
      .populate('students')
      .populate('teachers.subject');
    
    // Get recent messages
    const Message = require('../models/Message');
    const recentMessages = await Message.find({
      $or: [
        { sender: teacher.user },
        { 'recipients.user': teacher.user }
      ]
    })
      .sort({ sentAt: -1 })
      .limit(10)
      .populate('sender', 'firstName lastName');
    
    res.json({
      teacher,
      todaysClasses,
      recentMessages,
      stats: {
        totalClasses: teacher.classes.length,
        totalSubjects: teacher.subjects.length,
        isClassTeacher: !!teacher.classTeacherOf
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin/Principal/Teacher)
router.get('/', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { class: classId, year, search, status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (classId) query.currentClass = classId;
    if (year) query.yearGroup = year;
    if (status) query.status = status;
    
    const students = await Student.find(query)
      .populate('user', '-password')
      .populate('currentClass')
      .populate('parents')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ yearGroup: 1, house: 1 });
    
    // Format students with flattened structure for frontend
    let formattedStudents = students.map(student => ({
      _id: student._id,
      studentId: student.studentId,
      firstName: student.user?.firstName || '',
      lastName: student.user?.lastName || '',
      email: student.user?.email || '',
      phone: student.user?.phoneNumber || '',
      address: student.user?.address || {},
      yearGroup: student.yearGroup || student.currentYear,
      house: student.house,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      currentClass: student.currentClass,
      status: student.status || 'Active'
    }));
    
    // Filter by search if provided
    if (search) {
      formattedStudents = formattedStudents.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(search.toLowerCase()) ||
               (student.studentId && student.studentId.toLowerCase().includes(search.toLowerCase())) ||
               (student.email && student.email.toLowerCase().includes(search.toLowerCase()));
      });
    }
    
    const count = await Student.countDocuments(query);
    
    res.json({
      students: formattedStudents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error loading students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', '-password')
      .populate('currentClass')
      .populate('classes')
      .populate('parents')
      .populate('subjects')
      .populate({
        path: 'attendance',
        options: { sort: { date: -1 }, limit: 50 }
      })
      .populate({
        path: 'behavior',
        options: { sort: { date: -1 }, limit: 20 }
      });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check authorization
    if (req.user.role === 'parent') {
      const parentProfile = await Parent.findOne({ user: req.userId });
      if (!parentProfile.children.includes(student._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin/Principal)
router.post('/', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const { 
      email, firstName, lastName, phone, address,
      studentId, dateOfBirth, gender, yearGroup,
      house, currentClass
    } = req.body;
    
    if (!email || !firstName || !lastName || !yearGroup) {
      return res.status(400).json({ message: 'Missing required fields: email, firstName, lastName, yearGroup' });
    }
    
    // Generate default password from student ID or timestamp
    const defaultPassword = studentId || `STUDENT${Date.now()}`;
    
    // Create user account
    const user = new User({
      email,
      password: defaultPassword,
      firstName,
      lastName,
      role: 'student',
      phoneNumber: phone,
      address: { street: address || '' }
    });
    await user.save();
    
    // Map yearGroup to yearName
    const yearNames = ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'];
    const yearName = yearNames[yearGroup - 1] || 'First Year';
    
    // Create student profile
    const student = new Student({
      user: user._id,
      studentId: studentId || `24${Date.now().toString().slice(-6)}`,
      admissionNumber: `ADM${Date.now().toString().slice(-8)}`,
      dateOfBirth: dateOfBirth || new Date('2008-01-01'),
      gender: gender || 'Other',
      currentYear: yearGroup,
      yearGroup: yearName,
      yearName: yearName,
      house: house || 'Bride',
      currentClass,
      status: 'Active'
    });
    await student.save();
    
    // Link student to user
    user.studentProfile = student._id;
    await user.save();
    
    // Add student to class
    if (currentClass) {
      await Class.findByIdAndUpdate(currentClass, {
        $addToSet: { students: student._id }
      });
    }
    
    const populatedStudent = await Student.findById(student._id)
      .populate('user', '-password')
      .populate('currentClass');
    
    // Format for frontend
    const formattedStudent = {
      _id: populatedStudent._id,
      studentId: populatedStudent.studentId,
      firstName: populatedStudent.user.firstName,
      lastName: populatedStudent.user.lastName,
      email: populatedStudent.user.email,
      phone: populatedStudent.user.phoneNumber,
      yearGroup: yearName,
      house: populatedStudent.house,
      status: 'Active'
    };
    
    res.status(201).json({
      message: 'Student created successfully',
      student: formattedStudent
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin/Principal)
router.put('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('user', '-password')
      .populate('currentClass')
      .populate('parents');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Delete associated user account
    await User.findByIdAndDelete(student.user);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/students/:id/dashboard
// @desc    Get student dashboard data
// @access  Private (Student/Parent)
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', '-password')
      .populate('currentClass')
      .populate('timetable');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get recent attendance
    const Attendance = require('../models/Attendance');
    const recentAttendance = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(10)
      .populate('subject');
    
    // Get recent behavior logs
    const Behavior = require('../models/Behavior');
    const recentBehavior = await Behavior.find({ student: student._id })
      .sort({ date: -1 })
      .limit(10)
      .populate('reportedBy', 'firstName lastName')
      .populate('subject');
    
    // Get recent assessments
    const Assessment = require('../models/Assessment');
    const recentAssessments = await Assessment.find({
      'results.student': student._id,
      publishResults: true
    })
      .sort({ date: -1 })
      .limit(10)
      .populate('subject');
    
    // Calculate attendance percentage
    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ 
      student: student._id, 
      status: { $in: ['Present', 'Late'] }
    });
    const attendancePercentage = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(2) 
      : 0;
    
    res.json({
      student,
      recentAttendance,
      recentBehavior,
      recentAssessments,
      stats: {
        attendancePercentage,
        totalClasses: totalAttendance,
        presentCount,
        behaviorPoints: student.behavior?.reduce((sum, b) => sum + (b.points || 0), 0) || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

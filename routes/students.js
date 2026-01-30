const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');

// @route   GET /api/students/public/lookup
// @desc    Get students for enrollment lookup (public)
// @access  Public (for enrollment forms)
router.get('/public/lookup', async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    
    let query = {};
    let students = [];
    
    if (search && search.length > 0) {
      // Search by first name, last name, email, or student ID
      const searchRegex = { $regex: search, $options: 'i' };
      
      const users = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ]
      }).limit(limit);
      
      const userIds = users.map(u => u._id);
      
      if (userIds.length > 0) {
        query.user = { $in: userIds };
      }
      
      // Also search by student ID directly
      students = await Student.find({
        $or: [
          query,
          { studentId: searchRegex }
        ]
      })
        .populate('user', 'firstName lastName email phoneNumber address')
        .limit(limit)
        .lean();
    } else {
      students = await Student.find()
        .populate('user', 'firstName lastName email phoneNumber address')
        .limit(limit)
        .lean();
    }
    
    // Format for enrollment form
    const formattedStudents = students.map(student => ({
      _id: student._id,
      studentId: student.studentId,
      firstName: student.user?.firstName || '',
      lastName: student.user?.lastName || '',
      email: student.user?.email || '',
      phone: student.user?.phoneNumber || '',
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      pps: student.pps || '',
      yearGroup: student.yearGroup,
      house: student.house,
      address: student.user?.address || {},
      medicalInfo: student.medicalInfo || {},
      previousSchool: student.previousSchool || {}
    }));
    
    res.json({
      success: true,
      count: formattedStudents.length,
      students: formattedStudents
    });
  } catch (error) {
    console.error('Error fetching students for enrollment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

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

    if (req.user.role === 'student' && student.user?._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
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
      studentId, admissionNumber, dateOfBirth, gender, 
      yearGroup, house, currentClass, admissionDate,
      pps, lockerNumber, medicalInfo, previousSchool,
      notes, photoUrl, status
    } = req.body;
    
    if (!email || !firstName || !lastName || !yearGroup) {
      return res.status(400).json({ message: 'Missing required fields: email, firstName, lastName, yearGroup' });
    }
    
    // Check if student ID already exists
    if (studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
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
      address: address || { street: '' }
    });
    await user.save();
    
    // Map yearGroup to yearName
    const yearNames = ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'];
    const yearName = yearNames[yearGroup - 1] || 'First Year';
    
    // Prepare student data
    const studentData = {
      user: user._id,
      studentId: studentId || `24${Date.now().toString().slice(-6)}`,
      admissionNumber: admissionNumber || `ADM${Date.now().toString().slice(-8)}`,
      dateOfBirth: dateOfBirth || new Date('2008-01-01'),
      gender: gender || 'Other',
      currentYear: yearGroup,
      yearGroup: yearName,
      yearName: yearName,
      house: house || 'Bride',
      currentClass,
      admissionDate: admissionDate || new Date(),
      status: status || 'Active'
    };
    
    // Add optional fields if provided
    if (pps) studentData.pps = pps;
    if (lockerNumber) studentData.lockerNumber = lockerNumber;
    if (photoUrl) studentData.photoUrl = photoUrl;
    
    // Add medical information if provided
    if (medicalInfo) {
      studentData.medicalInfo = {
        bloodGroup: medicalInfo.bloodGroup,
        allergies: medicalInfo.allergies || [],
        conditions: medicalInfo.conditions || [],
        medications: medicalInfo.medications || [],
        emergencyContact: medicalInfo.emergencyContact || {}
      };
    }
    
    // Add previous school information if provided
    if (previousSchool && previousSchool.name) {
      studentData.previousSchool = {
        name: previousSchool.name,
        address: previousSchool.address,
        lastYear: previousSchool.lastYear
      };
    }
    
    // Add notes if provided
    if (notes) {
      studentData.notes = [{
        content: notes,
        createdBy: req.userId,
        createdAt: new Date()
      }];
    }
    
    // Create student profile
    const student = new Student(studentData);
    await student.save();
    
    // Link student to user
    user.studentProfile = student._id;
    await user.save();
    
    // Add student to class if specified
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
      dateOfBirth: populatedStudent.dateOfBirth,
      gender: populatedStudent.gender,
      yearGroup: yearName,
      house: populatedStudent.house,
      currentClass: populatedStudent.currentClass,
      status: populatedStudent.status,
      photoUrl: populatedStudent.photoUrl
    };
    
    res.status(201).json({
      message: 'Student created successfully',
      student: formattedStudent,
      defaultPassword: defaultPassword
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
    const { 
      firstName, lastName, email, phone, address,
      dateOfBirth, gender, pps, yearGroup, house, 
      lockerNumber, status, medicalInfo, previousSchool,
      notes, photoUrl
    } = req.body;
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update user information if provided
    if (firstName || lastName || email || phone || address) {
      const userUpdates = {};
      if (firstName) userUpdates.firstName = firstName;
      if (lastName) userUpdates.lastName = lastName;
      if (email) userUpdates.email = email;
      if (phone) userUpdates.phoneNumber = phone;
      if (address) userUpdates.address = address;
      
      await User.findByIdAndUpdate(student.user, userUpdates);
    }
    
    // Update student profile
    const studentUpdates = {};
    if (dateOfBirth) studentUpdates.dateOfBirth = dateOfBirth;
    if (gender) studentUpdates.gender = gender;
    if (pps) studentUpdates.pps = pps;
    if (lockerNumber) studentUpdates.lockerNumber = lockerNumber;
    if (status) studentUpdates.status = status;
    if (photoUrl !== undefined) studentUpdates.photoUrl = photoUrl;
    
    // Handle year group update
    if (yearGroup) {
      const yearNames = ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'];
      const yearName = yearNames[yearGroup - 1] || 'First Year';
      studentUpdates.currentYear = yearGroup;
      studentUpdates.yearGroup = yearName;
      studentUpdates.yearName = yearName;
    }
    
    if (house) studentUpdates.house = house;
    
    // Handle medical information
    if (medicalInfo) {
      studentUpdates.medicalInfo = {
        bloodGroup: medicalInfo.bloodGroup || student.medicalInfo?.bloodGroup,
        allergies: medicalInfo.allergies || student.medicalInfo?.allergies || [],
        conditions: medicalInfo.conditions || student.medicalInfo?.conditions || [],
        medications: medicalInfo.medications || student.medicalInfo?.medications || [],
        emergencyContact: {
          name: medicalInfo.emergencyContact?.name || student.medicalInfo?.emergencyContact?.name,
          relationship: medicalInfo.emergencyContact?.relationship || student.medicalInfo?.emergencyContact?.relationship,
          phone: medicalInfo.emergencyContact?.phone || student.medicalInfo?.emergencyContact?.phone
        }
      };
    }
    
    // Handle previous school information
    if (previousSchool) {
      studentUpdates.previousSchool = {
        name: previousSchool.name || student.previousSchool?.name,
        address: previousSchool.address || student.previousSchool?.address,
        lastYear: previousSchool.lastYear || student.previousSchool?.lastYear
      };
    }
    
    // Handle notes
    if (notes) {
      studentUpdates.notes = [
        ...(student.notes || []),
        {
          content: notes,
          createdBy: req.userId,
          createdAt: new Date()
        }
      ];
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      studentUpdates,
      { new: true, runValidators: true }
    )
      .populate('user', '-password')
      .populate('currentClass')
      .populate('parents');
    
    res.json({ 
      message: 'Student updated successfully', 
      student: updatedStudent 
    });
  } catch (error) {
    console.error('Error updating student:', error);
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

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private (Admin/Principal/Teacher)
router.get('/', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { year, academicYear, status, page = 1, limit = 50 } = req.query;
    
    let query = {};
    if (year) query.year = year;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;
    
    const classes = await Class.find(query)
      .populate('classTeacher', 'firstName lastName email')
      .populate('teachers.teacher', 'firstName lastName')
      .populate('teachers.subject')
      .populate('students', 'user studentId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: 1, section: 1 });
    
    const count = await Class.countDocuments(query);
    
    res.json({
      classes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private (Admin/Principal/Teacher)
router.get('/:id', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('classTeacher')
      .populate('teachers.teacher')
      .populate('teachers.subject')
      .populate({
        path: 'students',
        populate: { path: 'user', select: '-password' }
      })
      .populate('subjects')
      .populate('timetable');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin/Principal/Teacher)
router.post('/', auth, authorize('admin', 'principal', 'teacher', { allowWriteFor: ['teacher'] }), async (req, res) => {
  try {
    const {
      name, year, section, academicYear, classTeacher,
      teachers, students, capacity, room, subjects
    } = req.body;

    const yearNames = ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'];
    const yearGroup = yearNames[(year || 1) - 1] || 'First Year';

    let resolvedClassTeacher = classTeacher;
    if (req.user.role === 'teacher' && !resolvedClassTeacher) {
      const Teacher = require('../models/Teacher');
      const teacherProfile = await Teacher.findOne({ user: req.userId });
      resolvedClassTeacher = teacherProfile?._id;
    }
    
    const newClass = new Class({
      name,
      year,
      yearGroup,
      section,
      academicYear,
      classTeacher: resolvedClassTeacher,
      teachers,
      students,
      capacity,
      room,
      subjects
    });
    
    await newClass.save();
    
    // Update students' currentClass
    if (students && students.length > 0) {
      await Student.updateMany(
        { _id: { $in: students } },
        { currentClass: newClass._id, $addToSet: { classes: newClass._id } }
      );
    }
    
    const populatedClass = await Class.findById(newClass._id)
      .populate('classTeacher')
      .populate('teachers.teacher')
      .populate('teachers.subject')
      .populate('students');
    
    res.status(201).json({
      message: 'Class created successfully',
      class: populatedClass
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin/Principal/Teacher)
router.put('/:id', auth, authorize('admin', 'principal', 'teacher', { allowWriteFor: ['teacher'] }), async (req, res) => {
  try {
    const updates = req.body;
    if (updates.year && !updates.yearGroup) {
      const yearNames = ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'];
      updates.yearGroup = yearNames[updates.year - 1] || 'First Year';
    }
    
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('classTeacher')
      .populate('teachers.teacher')
      .populate('teachers.subject')
      .populate('students');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json({ message: 'Class updated successfully', class: classData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/classes/:id/students
// @desc    Add students to class
// @access  Private (Admin/Principal/Teacher)
router.post('/:id/students', auth, authorize('admin', 'principal', 'teacher', { allowWriteFor: ['teacher'] }), async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check capacity
    if (classData.students.length + studentIds.length > classData.capacity) {
      return res.status(400).json({ 
        message: 'Class capacity exceeded',
        available: classData.capacity - classData.students.length
      });
    }
    
    // Add students to class
    classData.students.push(...studentIds);
    await classData.save();
    
    // Update students' currentClass
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { currentClass: classData._id, $addToSet: { classes: classData._id } }
    );
    
    const populatedClass = await Class.findById(classData._id)
      .populate('students');
    
    res.json({ 
      message: 'Students added successfully',
      class: populatedClass
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/classes/:id/students/:studentId
// @desc    Remove student from class
// @access  Private (Admin/Principal)
router.delete('/:id/students/:studentId', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    classData.students = classData.students.filter(
      s => s.toString() !== req.params.studentId
    );
    await classData.save();
    
    res.json({ message: 'Student removed from class' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

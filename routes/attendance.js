const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const moment = require('moment');

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      student, class: classId, date, startDate, endDate,
      status, page = 1, limit = 50 
    } = req.query;
    
    let query = {};
    if (student) query.student = student;
    if (classId) query.class = classId;
    if (date) {
      const queryDate = new Date(date);
      query.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status) query.status = status;
    
    const attendance = await Attendance.find(query)
      .populate('student', 'studentId user')
      .populate('class', 'name year section')
      .populate('subject', 'name code')
      .populate('markedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1, period: 1 });
    
    const count = await Attendance.countDocuments(query);
    
    res.json({
      attendance,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/:id
// @desc    Get attendance record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('markedBy');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private (Teacher/Admin)
router.post('/', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const {
      student, class: classId, date, status, period,
      subject, reason, arrivalTime, departureTime, notes
    } = req.body;
    
    // Check if attendance already marked
    const existingAttendance = await Attendance.findOne({
      student,
      class: classId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      },
      period: period || { $exists: false }
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this student' });
    }
    
    const attendance = new Attendance({
      student,
      class: classId,
      date,
      status,
      period,
      subject,
      markedBy: req.userId,
      reason,
      arrivalTime,
      departureTime,
      notes
    });
    
    await attendance.save();
    
    // Add to student's attendance array
    await Student.findByIdAndUpdate(student, {
      $push: { attendance: attendance._id }
    });
    
    // Notify parent if absent
    if (status === 'Absent' || status === 'Late') {
      const studentData = await Student.findById(student).populate('parents');
      if (studentData && studentData.parents.length > 0) {
        // TODO: Send notification to parents
        attendance.parentNotified = true;
        attendance.notificationSentAt = new Date();
        await attendance.save();
      }
    }
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('markedBy');
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`class-${classId}`).emit('attendance-marked', populatedAttendance);
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: populatedAttendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance/bulk
// @desc    Mark bulk attendance for a class
// @access  Private (Teacher/Admin)
router.post('/bulk', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const { class: classId, date, period, subject, attendanceList } = req.body;
    
    const attendanceRecords = [];
    
    for (const record of attendanceList) {
      // Check if already marked
      const existing = await Attendance.findOne({
        student: record.studentId,
        class: classId,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
        },
        period: period || { $exists: false }
      });
      
      if (existing) continue;
      
      const attendance = new Attendance({
        student: record.studentId,
        class: classId,
        date,
        status: record.status,
        period,
        subject,
        markedBy: req.userId,
        reason: record.reason,
        notes: record.notes
      });
      
      await attendance.save();
      await Student.findByIdAndUpdate(record.studentId, {
        $push: { attendance: attendance._id }
      });
      
      attendanceRecords.push(attendance);
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`class-${classId}`).emit('attendance-bulk-marked', {
      classId,
      date,
      period
    });
    
    res.status(201).json({
      message: `Attendance marked for ${attendanceRecords.length} students`,
      count: attendanceRecords.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Teacher/Admin)
router.put('/:id', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('markedBy');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance updated successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/student/:studentId/report
// @desc    Get attendance report for a student
// @access  Private
router.get('/student/:studentId/report', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { student: req.params.studentId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const late = attendance.filter(a => a.status === 'Late').length;
    const excused = attendance.filter(a => a.status === 'Excused').length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;
    
    res.json({
      attendance,
      stats: {
        total,
        present,
        absent,
        late,
        excused,
        percentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/class/:classId/report
// @desc    Get attendance report for a class
// @access  Private (Teacher/Admin)
router.get('/class/:classId/report', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    
    const attendance = await Attendance.find({
      class: req.params.classId,
      date: {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      }
    })
      .populate('student', 'studentId user')
      .populate('subject', 'name');
    
    const Class = require('../models/Class');
    const classData = await Class.findById(req.params.classId).populate('students');
    
    const total = classData.students.length;
    const marked = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const absent = attendance.filter(a => a.status === 'Absent').length;
    const late = attendance.filter(a => a.status === 'Late').length;
    
    res.json({
      attendance,
      stats: {
        totalStudents: total,
        marked,
        unmarked: total - marked,
        present,
        absent,
        late,
        percentage: marked > 0 ? ((present + late) / marked * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

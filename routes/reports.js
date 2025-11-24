const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Behavior = require('../models/Behavior');
const Assessment = require('../models/Assessment');
const Payment = require('../models/Payment');
const moment = require('moment');

// @route   GET /api/reports/dashboard
// @desc    Get dashboard overview
// @access  Private (Admin/Principal)
router.get('/dashboard', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'Active' });
    const totalTeachers = await Teacher.countDocuments({ status: 'Active' });
    const totalClasses = await Class.countDocuments({ status: 'Active' });
    
    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;
    
    // Pending payments
    const pendingPayments = await Payment.countDocuments({
      status: { $in: ['Pending', 'Overdue'] }
    });
    
    const totalPendingAmount = await Payment.aggregate([
      { $match: { status: { $in: ['Pending', 'Overdue'] } } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' } } }
    ]);
    
    // Recent behavior incidents
    const recentBehavior = await Behavior.find({
      type: 'Negative',
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).countDocuments();
    
    // Upcoming assessments
    const upcomingAssessments = await Assessment.find({
      date: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: 'Scheduled'
    }).countDocuments();
    
    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        presentToday,
        absentToday,
        attendanceRate: todayAttendance.length > 0 
          ? ((presentToday / todayAttendance.length) * 100).toFixed(2)
          : 0,
        pendingPayments,
        totalPendingAmount: totalPendingAmount[0]?.total || 0,
        recentBehaviorIncidents: recentBehavior,
        upcomingAssessments
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/attendance
// @desc    Get attendance report
// @access  Private (Admin/Principal/Teacher)
router.get('/attendance', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { class: classId, startDate, endDate, groupBy = 'day' } = req.query;
    
    let query = {};
    if (classId) query.class = classId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate('student', 'studentId user')
      .populate('class', 'name year section')
      .sort({ date: 1 });
    
    // Group by specified period
    const grouped = {};
    attendance.forEach(record => {
      const key = groupBy === 'day'
        ? moment(record.date).format('YYYY-MM-DD')
        : groupBy === 'week'
        ? moment(record.date).format('YYYY-[W]WW')
        : moment(record.date).format('YYYY-MM');
      
      if (!grouped[key]) {
        grouped[key] = { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
      }
      
      grouped[key].total++;
      if (record.status === 'Present') grouped[key].present++;
      if (record.status === 'Absent') grouped[key].absent++;
      if (record.status === 'Late') grouped[key].late++;
      if (record.status === 'Excused') grouped[key].excused++;
    });
    
    // Calculate percentages
    Object.keys(grouped).forEach(key => {
      const data = grouped[key];
      data.percentage = data.total > 0 
        ? ((data.present / data.total) * 100).toFixed(2)
        : 0;
    });
    
    res.json({ attendance: grouped });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/academic
// @desc    Get academic performance report
// @access  Private (Admin/Principal/Teacher)
router.get('/academic', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { class: classId, subject, academicYear, term } = req.query;
    
    let query = { publishResults: true };
    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    
    const assessments = await Assessment.find(query)
      .populate('subject', 'name code')
      .populate('class', 'name year');
    
    let totalStudents = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let gradeDistribution = {};
    
    assessments.forEach(assessment => {
      assessment.results.forEach(result => {
        totalStudents++;
        if (result.isPassed) totalPassed++;
        else totalFailed++;
        
        gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
      });
    });
    
    const averagePerformance = totalStudents > 0
      ? ((totalPassed / totalStudents) * 100).toFixed(2)
      : 0;
    
    res.json({
      stats: {
        totalAssessments: assessments.length,
        totalStudents,
        totalPassed,
        totalFailed,
        averagePerformance,
        gradeDistribution
      },
      assessments: assessments.map(a => ({
        id: a._id,
        title: a.title,
        subject: a.subject,
        class: a.class,
        date: a.date,
        studentsCount: a.results.length,
        averageMarks: a.results.length > 0
          ? (a.results.reduce((sum, r) => sum + r.marksObtained, 0) / a.results.length).toFixed(2)
          : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/behavior
// @desc    Get behavior report
// @access  Private (Admin/Principal/Teacher)
router.get('/behavior', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { class: classId, type, severity, startDate, endDate } = req.query;
    
    let query = {};
    if (classId) query.class = classId;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const behaviors = await Behavior.find(query)
      .populate('student', 'studentId user')
      .populate('class', 'name')
      .sort({ date: -1 });
    
    const byType = behaviors.reduce((acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    }, {});
    
    const byCategory = behaviors.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});
    
    const bySeverity = behaviors.reduce((acc, b) => {
      if (b.severity) acc[b.severity] = (acc[b.severity] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      stats: {
        total: behaviors.length,
        byType,
        byCategory,
        bySeverity
      },
      behaviors: behaviors.slice(0, 50) // Recent 50
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/financial
// @desc    Get financial report
// @access  Private (Admin/Principal)
router.get('/financial', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const { academicYear, term, type, startDate, endDate } = req.query;
    
    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (type) query.type = type;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const payments = await Payment.find(query);
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalPending = payments.reduce((sum, p) => sum + p.remainingAmount, 0);
    const totalExpected = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    
    const byStatus = payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    const byType = payments.reduce((acc, p) => {
      if (!acc[p.type]) {
        acc[p.type] = { count: 0, revenue: 0, pending: 0 };
      }
      acc[p.type].count++;
      acc[p.type].revenue += p.paidAmount;
      acc[p.type].pending += p.remainingAmount;
      return acc;
    }, {});
    
    const collectionRate = totalExpected > 0
      ? ((totalRevenue / totalExpected) * 100).toFixed(2)
      : 0;
    
    res.json({
      stats: {
        totalRevenue,
        totalPending,
        totalExpected,
        collectionRate,
        byStatus,
        byType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/class/:classId
// @desc    Get comprehensive class report
// @access  Private (Admin/Principal/Teacher)
router.get('/class/:classId', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId)
      .populate('classTeacher')
      .populate('students')
      .populate('subjects');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const studentIds = classData.students.map(s => s._id);
    
    // Attendance stats
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const attendanceRate = attendanceRecords.length > 0
      ? ((attendanceRecords.filter(a => a.status === 'Present').length / attendanceRecords.length) * 100).toFixed(2)
      : 0;
    
    // Behavior stats
    const behaviorRecords = await Behavior.find({
      class: req.params.classId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Assessment stats
    const assessmentRecords = await Assessment.find({
      class: req.params.classId,
      publishResults: true
    });
    
    const averagePerformance = assessmentRecords.length > 0
      ? assessmentRecords.reduce((sum, a) => {
          const avg = a.results.length > 0
            ? a.results.reduce((s, r) => s + r.percentage, 0) / a.results.length
            : 0;
          return sum + avg;
        }, 0) / assessmentRecords.length
      : 0;
    
    res.json({
      class: {
        id: classData._id,
        name: classData.name,
        year: classData.year,
        section: classData.section,
        classTeacher: classData.classTeacher,
        totalStudents: classData.students.length,
        capacity: classData.capacity,
        subjects: classData.subjects
      },
      stats: {
        attendanceRate,
        totalBehaviorIncidents: behaviorRecords.length,
        positiveBehavior: behaviorRecords.filter(b => b.type === 'Positive').length,
        negativeBehavior: behaviorRecords.filter(b => b.type === 'Negative').length,
        averagePerformance: averagePerformance.toFixed(2),
        totalAssessments: assessmentRecords.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Behavior = require('../models/Behavior');
const Student = require('../models/Student');

// @route   GET /api/behavior
// @desc    Get behavior logs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      student, class: classId, type, category, severity,
      startDate, endDate, status, page = 1, limit = 50
    } = req.query;
    
    let query = {};
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.userId });
      if (!studentProfile) {
        return res.status(403).json({ message: 'Access denied' });
      }
      query.student = studentProfile._id;
    } else if (student) {
      query.student = student;
    }
    if (classId) query.class = classId;
    if (type) query.type = type;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const behaviors = await Behavior.find(query)
      .populate('student', 'studentId user')
      .populate('class', 'name year section')
      .populate('subject', 'name')
      .populate('reportedBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });
    
    const count = await Behavior.countDocuments(query);
    
    res.json({
      behaviors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/behavior/:id
// @desc    Get behavior log by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const behavior = await Behavior.findById(req.params.id)
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('reportedBy');
    
    if (!behavior) {
      return res.status(404).json({ message: 'Behavior log not found' });
    }

    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.userId });
      if (!studentProfile || behavior.student?._id.toString() !== studentProfile._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    res.json(behavior);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/behavior
// @desc    Create behavior log
// @access  Private (Teacher/Admin)
router.post('/', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const {
      student, class: classId, type, category, severity, title,
      description, date, period, subject, actionTaken,
      followUpRequired, followUpDate, points
    } = req.body;
    
    const behavior = new Behavior({
      student,
      class: classId,
      type,
      category,
      severity,
      title,
      description,
      date: date || new Date(),
      period,
      subject,
      reportedBy: req.userId,
      actionTaken,
      followUpRequired,
      followUpDate,
      points: points || (type === 'Positive' ? 5 : type === 'Negative' ? -5 : 0)
    });
    
    await behavior.save();
    
    // Add to student's behavior array
    await Student.findByIdAndUpdate(student, {
      $push: { behavior: behavior._id }
    });
    
    // Notify parent for significant behavior
    if (type === 'Negative' && (severity === 'High' || severity === 'Critical')) {
      const studentData = await Student.findById(student).populate('parents');
      if (studentData && studentData.parents.length > 0) {
        // TODO: Send notification to parents
        behavior.parentNotified = true;
        behavior.notificationSentAt = new Date();
        await behavior.save();
      }
    }
    
    const populatedBehavior = await Behavior.findById(behavior._id)
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('reportedBy');
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`student-${student}`).emit('behavior-logged', populatedBehavior);
    
    res.status(201).json({
      message: 'Behavior log created successfully',
      behavior: populatedBehavior
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/behavior/:id
// @desc    Update behavior log
// @access  Private (Teacher/Admin)
router.put('/:id', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    
    const behavior = await Behavior.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('student')
      .populate('class')
      .populate('subject')
      .populate('reportedBy');
    
    if (!behavior) {
      return res.status(404).json({ message: 'Behavior log not found' });
    }
    
    res.json({ message: 'Behavior log updated successfully', behavior });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/behavior/:id
// @desc    Delete behavior log
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const behavior = await Behavior.findByIdAndDelete(req.params.id);
    
    if (!behavior) {
      return res.status(404).json({ message: 'Behavior log not found' });
    }
    
    res.json({ message: 'Behavior log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/behavior/:id/acknowledge
// @desc    Parent acknowledges behavior log
// @access  Private (Parent)
router.put('/:id/acknowledge', auth, authorize('parent'), async (req, res) => {
  try {
    const { comments } = req.body;
    
    const behavior = await Behavior.findById(req.params.id);
    
    if (!behavior) {
      return res.status(404).json({ message: 'Behavior log not found' });
    }
    
    behavior.parentAcknowledged = true;
    behavior.parentComments = comments;
    await behavior.save();
    
    res.json({ message: 'Behavior log acknowledged', behavior });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/behavior/student/:studentId/report
// @desc    Get behavior report for a student
// @access  Private
router.get('/student/:studentId/report', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.userId });
      if (!studentProfile || studentProfile._id.toString() !== req.params.studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    let query = { student: req.params.studentId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const behaviors = await Behavior.find(query)
      .sort({ date: -1 })
      .populate('reportedBy', 'firstName lastName')
      .populate('subject', 'name');
    
    const positive = behaviors.filter(b => b.type === 'Positive').length;
    const negative = behaviors.filter(b => b.type === 'Negative').length;
    const neutral = behaviors.filter(b => b.type === 'Neutral').length;
    const totalPoints = behaviors.reduce((sum, b) => sum + (b.points || 0), 0);
    
    // Group by category
    const byCategory = behaviors.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      behaviors,
      stats: {
        total: behaviors.length,
        positive,
        negative,
        neutral,
        totalPoints,
        byCategory
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/behavior/class/:classId/report
// @desc    Get behavior report for a class
// @access  Private (Teacher/Admin)
router.get('/class/:classId/report', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { class: req.params.classId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const behaviors = await Behavior.find(query)
      .populate('student', 'studentId user')
      .populate('reportedBy', 'firstName lastName');
    
    const positive = behaviors.filter(b => b.type === 'Positive').length;
    const negative = behaviors.filter(b => b.type === 'Negative').length;
    
    res.json({
      behaviors,
      stats: {
        total: behaviors.length,
        positive,
        negative,
        ratio: negative > 0 ? (positive / negative).toFixed(2) : 'N/A'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

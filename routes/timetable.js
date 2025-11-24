const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Timetable = require('../models/Timetable');

// @route   GET /api/timetable
// @desc    Get timetables
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { class: classId, teacher, academicYear, term, status } = req.query;
    
    let query = {};
    if (classId) query.class = classId;
    if (teacher) query.teacher = teacher;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (status) query.status = status;
    
    const timetables = await Timetable.find(query)
      .populate('class')
      .populate('teacher')
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json({ timetables });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/timetable/:id
// @desc    Get timetable by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('class')
      .populate('teacher')
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher', 'firstName lastName');
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/timetable
// @desc    Create new timetable
// @access  Private (Admin/Principal/Teacher with permission)
router.post('/', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    // Check teacher permission
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findOne({ user: req.userId });
      if (!teacher?.permissions?.canEditTimetable) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }
    
    const {
      class: classId, teacher, academicYear, term,
      schedule, effectiveFrom, effectiveTo, notes
    } = req.body;
    
    const timetable = new Timetable({
      class: classId,
      teacher,
      academicYear,
      term,
      schedule,
      effectiveFrom,
      effectiveTo,
      notes,
      status: 'Draft'
    });
    
    await timetable.save();
    
    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('class')
      .populate('teacher')
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher');
    
    res.status(201).json({
      message: 'Timetable created successfully',
      timetable: populatedTimetable
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/timetable/:id
// @desc    Update timetable
// @access  Private (Admin/Principal/Teacher with permission)
router.put('/:id', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    // Check teacher permission
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findOne({ user: req.userId });
      if (!teacher?.permissions?.canEditTimetable) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }
    
    const updates = req.body;
    
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('class')
      .populate('teacher')
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher');
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (timetable.class) {
      io.to(`class-${timetable.class._id}`).emit('timetable-updated', timetable);
    }
    
    res.json({ message: 'Timetable updated successfully', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/timetable/:id/publish
// @desc    Publish timetable
// @access  Private (Admin/Principal)
router.put('/:id/publish', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    timetable.status = 'Published';
    await timetable.save();
    
    // Update class/teacher timetable reference
    if (timetable.class) {
      const Class = require('../models/Class');
      await Class.findByIdAndUpdate(timetable.class, { timetable: timetable._id });
    }
    if (timetable.teacher) {
      const Teacher = require('../models/Teacher');
      await Teacher.findByIdAndUpdate(timetable.teacher, { timetable: timetable._id });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    if (timetable.class) {
      io.to(`class-${timetable.class}`).emit('timetable-published', timetable);
    }
    
    res.json({ message: 'Timetable published successfully', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete timetable
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/timetable/class/:classId/current
// @desc    Get current timetable for a class
// @access  Private
router.get('/class/:classId/current', auth, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      class: req.params.classId,
      status: 'Published',
      effectiveFrom: { $lte: new Date() },
      $or: [
        { effectiveTo: { $gte: new Date() } },
        { effectiveTo: null }
      ]
    })
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher', 'firstName lastName')
      .sort({ effectiveFrom: -1 });
    
    if (!timetable) {
      return res.status(404).json({ message: 'No current timetable found for this class' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/timetable/teacher/:teacherId/current
// @desc    Get current timetable for a teacher
// @access  Private
router.get('/teacher/:teacherId/current', auth, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({
      teacher: req.params.teacherId,
      status: 'Published',
      effectiveFrom: { $lte: new Date() },
      $or: [
        { effectiveTo: { $gte: new Date() } },
        { effectiveTo: null }
      ]
    })
      .populate('schedule.periods.subject')
      .populate('schedule.periods.teacher', 'firstName lastName')
      .populate('class')
      .sort({ effectiveFrom: -1 });
    
    if (!timetable) {
      return res.status(404).json({ message: 'No current timetable found for this teacher' });
    }
    
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

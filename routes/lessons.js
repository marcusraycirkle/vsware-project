const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Lesson = require('../models/Lesson');
const Teacher = require('../models/Teacher');

// @route   GET /api/lessons
// @desc    Get lessons
// @access  Private (Admin/Principal/Teacher)
router.get('/', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { class: classId, teacher, dayOfWeek } = req.query;

    const query = {};
    if (classId) query.class = classId;
    if (teacher) query.teacher = teacher;
    if (dayOfWeek) query.dayOfWeek = dayOfWeek;

    const lessons = await Lesson.find(query)
      .populate('class')
      .populate('teacher')
      .populate('subject')
      .populate('room')
      .populate('period')
      .sort({ dayOfWeek: 1, startDate: 1 });

    res.json({ lessons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/lessons
// @desc    Create lesson
// @access  Private (Admin/Principal/Teacher)
router.post('/', auth, authorize('admin', 'principal', 'teacher', { allowWriteFor: ['teacher'] }), async (req, res) => {
  try {
    const { class: classId, teacher, subject, room, period, dayOfWeek, startDate, endDate, isRecurring, notes } = req.body;

    let teacherId = teacher;
    if (req.user.role === 'teacher' && !teacherId) {
      const teacherProfile = await Teacher.findOne({ user: req.userId });
      teacherId = teacherProfile?._id;
    }

    if (!classId || !teacherId || !period || !dayOfWeek || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const lesson = new Lesson({
      class: classId,
      teacher: teacherId,
      subject,
      room,
      period,
      dayOfWeek,
      startDate,
      endDate,
      isRecurring: !!isRecurring,
      notes
    });

    await lesson.save();

    const populated = await Lesson.findById(lesson._id)
      .populate('class')
      .populate('teacher')
      .populate('subject')
      .populate('room')
      .populate('period');

    res.status(201).json({ message: 'Lesson created successfully', lesson: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/lessons/:id
// @desc    Update lesson
// @access  Private (Admin/Principal)
router.put('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('class')
      .populate('teacher')
      .populate('subject')
      .populate('room')
      .populate('period');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/lessons/:id
// @desc    Delete lesson
// @access  Private (Admin/Principal)
router.delete('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

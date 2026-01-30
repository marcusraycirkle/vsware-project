const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Period = require('../models/Period');

// @route   GET /api/periods
// @desc    Get all periods
// @access  Private (Admin/Principal/Teacher)
router.get('/', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const periods = await Period.find({ isActive: true }).sort({ order: 1 });
    res.json({ periods });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/periods
// @desc    Create period
// @access  Private (Admin/Principal)
router.post('/', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const { name, startTime, endTime, order, isBreak } = req.body;

    if (!name || !startTime || !endTime || order === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const period = new Period({ name, startTime, endTime, order, isBreak: !!isBreak });
    await period.save();

    res.status(201).json({ message: 'Period created successfully', period });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/periods/:id
// @desc    Update period
// @access  Private (Admin/Principal)
router.put('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    const period = await Period.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    res.json({ message: 'Period updated successfully', period });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/periods/:id
// @desc    Delete (deactivate) period
// @access  Private (Admin/Principal)
router.delete('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const period = await Period.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }

    res.json({ message: 'Period deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

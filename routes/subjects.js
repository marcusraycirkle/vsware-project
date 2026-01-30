const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Subject = require('../models/Subject');

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private (Admin/Principal/Teacher)
router.get('/', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

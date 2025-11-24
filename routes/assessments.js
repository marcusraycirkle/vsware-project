const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');

// @route   GET /api/assessments
// @desc    Get assessments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      subject, class: classId, type, academicYear, term,
      status, page = 1, limit = 20
    } = req.query;
    
    let query = {};
    if (subject) query.subject = subject;
    if (classId) query.class = classId;
    if (type) query.type = type;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (status) query.status = status;
    
    const assessments = await Assessment.find(query)
      .populate('subject', 'name code')
      .populate('class', 'name year section')
      .populate('teacher', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });
    
    const count = await Assessment.countDocuments(query);
    
    res.json({
      assessments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get assessment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('subject')
      .populate('class')
      .populate('teacher')
      .populate('results.student', 'studentId user');
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    // Filter results for students/parents
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.userId });
      assessment.results = assessment.results.filter(
        r => r.student._id.toString() === student._id.toString()
      );
    } else if (req.user.role === 'parent') {
      const Parent = require('../models/Parent');
      const parent = await Parent.findOne({ user: req.userId }).populate('children');
      const childIds = parent.children.map(c => c._id.toString());
      assessment.results = assessment.results.filter(
        r => childIds.includes(r.student._id.toString())
      );
    }
    
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assessments
// @desc    Create new assessment
// @access  Private (Teacher/Admin)
router.post('/', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const {
      title, type, subject, class: classId, academicYear, term,
      date, maxMarks, passingMarks, weightage, duration,
      syllabus, instructions
    } = req.body;
    
    const assessment = new Assessment({
      title,
      type,
      subject,
      class: classId,
      teacher: req.userId,
      academicYear,
      term,
      date,
      maxMarks,
      passingMarks,
      weightage,
      duration,
      syllabus,
      instructions,
      status: 'Scheduled'
    });
    
    await assessment.save();
    
    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('subject')
      .populate('class')
      .populate('teacher');
    
    res.status(201).json({
      message: 'Assessment created successfully',
      assessment: populatedAssessment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/assessments/:id
// @desc    Update assessment
// @access  Private (Teacher/Admin)
router.put('/:id', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const updates = req.body;
    
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('subject')
      .populate('class')
      .populate('teacher');
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    res.json({ message: 'Assessment updated successfully', assessment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assessments/:id/results
// @desc    Add/Update assessment results
// @access  Private (Teacher/Admin)
router.post('/:id/results', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const { results } = req.body; // Array of { student, marksObtained, remarks }
    
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    // Update or add results
    for (const result of results) {
      const existingIndex = assessment.results.findIndex(
        r => r.student.toString() === result.student
      );
      
      if (existingIndex >= 0) {
        assessment.results[existingIndex] = {
          ...assessment.results[existingIndex],
          ...result,
          submittedOn: new Date()
        };
      } else {
        assessment.results.push({
          ...result,
          submittedOn: new Date()
        });
      }
    }
    
    assessment.status = 'Completed';
    await assessment.save();
    
    const populatedAssessment = await Assessment.findById(assessment._id)
      .populate('results.student', 'studentId user');
    
    res.json({
      message: 'Results added successfully',
      assessment: populatedAssessment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/assessments/:id/publish
// @desc    Publish assessment results
// @access  Private (Teacher/Admin)
router.put('/:id/publish', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    assessment.publishResults = true;
    assessment.publishedAt = new Date();
    assessment.status = 'Results Published';
    await assessment.save();
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`class-${assessment.class}`).emit('results-published', assessment);
    
    res.json({ message: 'Results published successfully', assessment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/assessments/:id
// @desc    Delete assessment
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/student/:studentId/report
// @desc    Get assessment report for a student
// @access  Private
router.get('/student/:studentId/report', auth, async (req, res) => {
  try {
    const { academicYear, term, subject } = req.query;
    
    let query = {
      'results.student': req.params.studentId,
      publishResults: true
    };
    
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (subject) query.subject = subject;
    
    const assessments = await Assessment.find(query)
      .populate('subject', 'name code')
      .populate('class', 'name')
      .sort({ date: -1 });
    
    // Extract student's results
    const results = assessments.map(assessment => {
      const studentResult = assessment.results.find(
        r => r.student.toString() === req.params.studentId
      );
      
      return {
        assessment: {
          id: assessment._id,
          title: assessment.title,
          type: assessment.type,
          subject: assessment.subject,
          date: assessment.date,
          maxMarks: assessment.maxMarks,
          passingMarks: assessment.passingMarks
        },
        result: studentResult
      };
    });
    
    // Calculate statistics
    const totalAssessments = results.length;
    const passed = results.filter(r => r.result?.isPassed).length;
    const failed = totalAssessments - passed;
    const averagePercentage = totalAssessments > 0
      ? (results.reduce((sum, r) => sum + (r.result?.percentage || 0), 0) / totalAssessments).toFixed(2)
      : 0;
    
    res.json({
      results,
      stats: {
        totalAssessments,
        passed,
        failed,
        averagePercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/class/:classId/analytics
// @desc    Get assessment analytics for a class
// @access  Private (Teacher/Admin)
router.get('/class/:classId/analytics', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const { assessmentId } = req.query;
    
    const assessment = await Assessment.findOne({
      _id: assessmentId,
      class: req.params.classId
    })
      .populate('results.student', 'studentId user');
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    const results = assessment.results;
    const totalStudents = results.length;
    const passed = results.filter(r => r.isPassed).length;
    const failed = totalStudents - passed;
    
    const averageMarks = totalStudents > 0
      ? (results.reduce((sum, r) => sum + r.marksObtained, 0) / totalStudents).toFixed(2)
      : 0;
    
    const highestMarks = Math.max(...results.map(r => r.marksObtained));
    const lowestMarks = Math.min(...results.map(r => r.marksObtained));
    
    // Grade distribution
    const gradeDistribution = results.reduce((acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      assessment: {
        id: assessment._id,
        title: assessment.title,
        type: assessment.type,
        maxMarks: assessment.maxMarks
      },
      analytics: {
        totalStudents,
        passed,
        failed,
        passPercentage: totalStudents > 0 ? ((passed / totalStudents) * 100).toFixed(2) : 0,
        averageMarks,
        highestMarks,
        lowestMarks,
        gradeDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

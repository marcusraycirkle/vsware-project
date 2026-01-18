const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

// ========== DASHBOARD STATISTICS ==========

// Get dashboard statistics
router.get('/dashboard/stats', auth, async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const schoolId = req.user.schoolId;

        // Get counts
        const totalStudents = await Student.countDocuments({ schoolId, status: 'active' });
        const totalTeachers = await Teacher.countDocuments({ schoolId, status: 'active' });
        const totalClasses = await Class.countDocuments({ schoolId });
        
        // Calculate attendance rate (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const attendanceRecords = await Attendance.find({
            schoolId,
            date: { $gte: sevenDaysAgo }
        });
        
        let presentCount = 0;
        let totalRecords = attendanceRecords.length;
        
        attendanceRecords.forEach(record => {
            presentCount += record.status === 'present' ? 1 : 0;
        });
        
        const attendanceRate = totalRecords > 0 
            ? ((presentCount / totalRecords) * 100).toFixed(1)
            : 0;

        res.json({
            students: {
                total: totalStudents,
                change: '+5.2%'
            },
            teachers: {
                total: totalTeachers,
                change: '+3'
            },
            classes: {
                total: totalClasses,
                change: '0'
            },
            attendanceRate: {
                value: `${attendanceRate}%`,
                change: '+2.1%'
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get recent activity
router.get('/dashboard/activity', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const schoolId = req.user.schoolId;
        const limit = parseInt(req.query.limit) || 10;

        // Get recent students
        const recentStudents = await Student.find({ schoolId })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('firstName lastName createdAt');

        // Get recent attendance submissions (if you have a submissions collection)
        // For now, return mock activity
        const activities = [
            ...recentStudents.map(student => ({
                type: 'student_enrolled',
                icon: 'user-plus',
                color: 'blue',
                title: 'New student enrolled',
                detail: `${student.firstName} ${student.lastName} added`,
                timestamp: student.createdAt
            }))
        ];

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ========== SCHOOL SETTINGS ==========

// Get school settings
router.get('/settings/school', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Return default settings (extend this with a SchoolSettings model)
        const settings = {
            name: "St. Patrick's Comprehensive School",
            address: "Shannon, Co. Clare, Ireland",
            phone: "+353 61 123456",
            email: "info@stpatricks.ie",
            academicYear: "2025-2026",
            termStartDate: "2025-09-01",
            termEndDate: "2026-06-30"
        };

        res.json(settings);
    } catch (error) {
        console.error('Error fetching school settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update school settings
router.put('/settings/school', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // TODO: Implement SchoolSettings model and save
        const settings = req.body;
        
        res.json({
            message: 'School settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating school settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ========== CUSTOMIZATION SETTINGS ==========

// Get customization settings
router.get('/settings/customization', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Return default customization (extend with CustomizationSettings model)
        const customization = {
            colors: {
                primary: '#4F46E5',
                accent: '#10B981'
            },
            theme: 'light',
            logo: null,
            schoolName: "St. Patrick's Comprehensive",
            layout: {
                compactSidebar: true,
                fixedHeader: false,
                roundedCorners: true
            },
            typography: {
                fontFamily: 'Inter',
                fontSize: 'medium'
            }
        };

        res.json(customization);
    } catch (error) {
        console.error('Error fetching customization:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update customization settings
router.put('/settings/customization', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const customization = req.body;
        
        // TODO: Save to CustomizationSettings model
        
        res.json({
            message: 'Customization settings updated successfully',
            customization
        });
    } catch (error) {
        console.error('Error updating customization:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ========== USER MANAGEMENT ==========

// Get all system users
router.get('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const schoolId = req.user.schoolId;
        const users = await User.find({ schoolId })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new user
router.post('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, role, password } = req.body;
        const schoolId = req.user.schoolId;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = new User({
            name,
            email,
            password,
            role,
            schoolId
        });

        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user
router.put('/users/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, role, status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (status) user.status = status;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user
router.delete('/users/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.deleteOne();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ========== BULK OPERATIONS ==========

// Bulk import students
router.post('/students/import', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { students } = req.body;
        const schoolId = req.user.schoolId;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: 'Invalid student data' });
        }

        const importedStudents = [];
        const errors = [];

        for (let i = 0; i < students.length; i++) {
            try {
                const studentData = { ...students[i], schoolId };
                const student = new Student(studentData);
                await student.save();
                importedStudents.push(student);
            } catch (error) {
                errors.push({
                    row: i + 1,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Import completed',
            imported: importedStudents.length,
            errors: errors.length,
            errorDetails: errors
        });
    } catch (error) {
        console.error('Error importing students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Export students
router.get('/students/export', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const schoolId = req.user.schoolId;
        const students = await Student.find({ schoolId })
            .select('firstName lastName studentId email yearGroup dateOfBirth status');

        res.json(students);
    } catch (error) {
        console.error('Error exporting students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Export teachers
router.get('/teachers/export', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const schoolId = req.user.schoolId;
        const teachers = await Teacher.find({ schoolId })
            .select('firstName lastName teacherId email subject status');

        res.json(teachers);
    } catch (error) {
        console.error('Error exporting teachers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ========== ANALYTICS ==========

// Get analytics data
router.get('/analytics', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'principal') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const schoolId = req.user.schoolId;
        const { period = '7days' } = req.query;

        // Calculate date range
        let startDate = new Date();
        switch (period) {
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Get attendance trends
        const attendanceTrends = await Attendance.aggregate([
            {
                $match: {
                    schoolId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$date" }
                    },
                    total: { $sum: 1 },
                    present: {
                        $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            period,
            attendanceTrends,
            message: 'Analytics data retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

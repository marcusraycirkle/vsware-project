const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const accountCreationTemplate = require('../utils/emailTemplates/accountCreation');

// Teacher role hierarchy levels
const TEACHER_ROLES = {
  'Avg': { level: 1, permissions: ['view_grades', 'view_attendance', 'add_notes'] },
  'Mid': { level: 2, permissions: ['view_grades', 'view_attendance', 'add_notes', 'manage_assessments', 'send_messages'] },
  'High': { level: 3, permissions: ['view_grades', 'view_attendance', 'add_notes', 'manage_assessments', 'send_messages', 'manage_classes'] },
  'HR': { level: 4, permissions: ['view_grades', 'view_attendance', 'add_notes', 'manage_assessments', 'send_messages', 'manage_classes', 'manage_staff', 'manage_subjects'] }
};

// Generate random 6-digit PIN
const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString();

// Get all staff (accessible by Principal and Secretary)
router.get('/staff', auth, authorize(['Principal', 'Secretary']), async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['Teacher', 'Secretary', 'Principal'] } })
      .select('email name role department designation roleHierarchy createdAt')
      .lean();
    
    res.json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new staff account (Principal and Secretary)
router.post('/staff/create', auth, authorize(['Principal', 'Secretary']), async (req, res) => {
  try {
    const { email, name, role, department, designation, roleHierarchy } = req.body;

    // Validate required fields
    if (!email || !name || !role) {
      return res.status(400).json({ success: false, message: 'Email, name, and role are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Generate temporary PIN
    const tempPin = generatePin();

    // Create new user
    const newUser = new User({
      email,
      name,
      role,
      pin: tempPin,
      department: department || null,
      designation: designation || null,
      roleHierarchy: roleHierarchy || (role === 'Teacher' ? 'Avg' : role),
      isActive: true,
      createdBy: req.user._id,
      createdAt: new Date()
    });

    await newUser.save();

    // Send account creation email
    try {
      const emailContent = accountCreationTemplate.generateAccountCreationEmail(email, tempPin);
      await emailService.sendEmail({
        to: email,
        subject: 'MISpal Account Created - Your Credentials Inside',
        html: emailContent,
        from: 'accounts@shannoncomp.ie'
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tempPin: tempPin,
        roleHierarchy: newUser.roleHierarchy
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update staff account
router.put('/staff/:id', auth, authorize(['Principal', 'Secretary']), async (req, res) => {
  try {
    const { name, department, designation, roleHierarchy, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || undefined,
        department: department || undefined,
        designation: designation || undefined,
        roleHierarchy: roleHierarchy || undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      { new: true }
    ).select('email name role department designation roleHierarchy');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Staff account updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete staff account
router.delete('/staff/:id', auth, authorize(['Principal']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send account deletion email before deleting
    try {
      const emailContent = `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>MISpal Account Deleted</h2>
            <p>Dear ${user.name},</p>
            <p>Your MISpal account (${user.email}) has been deleted by your Principal.</p>
            <p>If this was unexpected, please contact your Principal immediately.</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
            <p style="color: #666; font-size: 0.9em;">© Cirkle Development 2025 - MISpal School Administration Software<br/>This is an automated email from accounts@shannoncomp.ie</p>
          </body>
        </html>
      `;
      
      await emailService.sendEmail({
        to: user.email,
        subject: 'MISpal Account Deleted',
        html: emailContent,
        from: 'accounts@shannoncomp.ie'
      });
    } catch (emailError) {
      console.error('Failed to send deletion email:', emailError);
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Staff account deleted successfully',
      deletedUser: {
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get teacher role hierarchy levels
router.get('/teachers/roles', auth, authorize(['Principal', 'Secretary']), (req, res) => {
  res.json({
    success: true,
    roles: TEACHER_ROLES
  });
});

// Update teacher role hierarchy
router.put('/teachers/:id/role', auth, authorize(['Principal']), async (req, res) => {
  try {
    const { roleHierarchy } = req.body;

    if (!TEACHER_ROLES[roleHierarchy]) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid role. Allowed roles: ${Object.keys(TEACHER_ROLES).join(', ')}` 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roleHierarchy },
      { new: true }
    ).select('email name role roleHierarchy');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({
      success: true,
      message: 'Teacher role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset PIN for a user (Principal only)
router.post('/staff/:id/reset-pin', auth, authorize(['Principal']), async (req, res) => {
  try {
    const newPin = generatePin();
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { pin: newPin },
      { new: true }
    ).select('email name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send PIN reset email
    try {
      const emailContent = `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>MISpal PIN Reset</h2>
            <p>Dear ${user.name},</p>
            <p>Your MISpal PIN has been reset by your Principal.</p>
            <p><strong>New PIN: ${newPin}</strong></p>
            <p>Please change this PIN immediately after logging in.</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
            <p style="color: #666; font-size: 0.9em;">© Cirkle Development 2025 - MISpal School Administration Software<br/>This is an automated email from accounts@shannoncomp.ie</p>
          </body>
        </html>
      `;
      
      await emailService.sendEmail({
        to: user.email,
        subject: 'MISpal PIN Reset',
        html: emailContent,
        from: 'accounts@shannoncomp.ie'
      });
    } catch (emailError) {
      console.error('Failed to send PIN reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'PIN reset successfully',
      data: {
        email: user.email,
        tempPin: newPin
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

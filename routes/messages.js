const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// @route   GET /api/messages
// @desc    Get messages for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, folder = 'inbox', page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (folder === 'inbox') {
      query['recipients.user'] = req.userId;
    } else if (folder === 'sent') {
      query.sender = req.userId;
    } else if (folder === 'starred') {
      query['recipients.user'] = req.userId;
      query['recipients.starred'] = true;
    } else if (folder === 'archived') {
      query['recipients.user'] = req.userId;
      query['recipients.archived'] = true;
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email profileImage role')
      .populate('recipients.user', 'firstName lastName email')
      .populate('relatedClass', 'name year section')
      .populate('relatedStudent', 'studentId user')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ sentAt: -1 });
    
    const count = await Message.countDocuments(query);
    
    res.json({
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/messages/:id
// @desc    Get message by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName email profileImage role')
      .populate('recipients.user', 'firstName lastName email')
      .populate('relatedClass', 'name year section')
      .populate('relatedStudent', 'studentId user')
      .populate({
        path: 'replies',
        populate: { path: 'sender', select: 'firstName lastName email' }
      });
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check authorization
    const isRecipient = message.recipients.some(
      r => r.user._id.toString() === req.userId
    );
    const isSender = message.sender._id.toString() === req.userId;
    
    if (!isRecipient && !isSender) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Mark as read if recipient
    if (isRecipient) {
      const recipient = message.recipients.find(
        r => r.user._id.toString() === req.userId
      );
      if (!recipient.read) {
        recipient.read = true;
        recipient.readAt = new Date();
        await message.save();
      }
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      recipients, recipientType, subject, body, type, priority, category,
      attachments, relatedClass, relatedStudent, scheduledFor
    } = req.body;
    
    let recipientIds = [];
    
    // Handle different recipient types
    if (recipientType) {
      const Student = require('../models/Student');
      const Teacher = require('../models/Teacher');
      const Parent = require('../models/Parent');
      
      switch(recipientType) {
        case 'all-students':
          const students = await Student.find().populate('user');
          recipientIds = students.map(s => s.user._id.toString());
          break;
        case 'all-teachers':
          const teachers = await Teacher.find().populate('user');
          recipientIds = teachers.map(t => t.user._id.toString());
          break;
        case 'all-parents':
          const parents = await Parent.find().populate('user');
          recipientIds = parents.map(p => p.user._id.toString());
          break;
        case 'class':
          if (relatedClass) {
            const Class = require('../models/Class');
            const classData = await Class.findById(relatedClass).populate({
              path: 'students',
              populate: { path: 'user' }
            });
            recipientIds = classData.students.map(s => s.user._id.toString());
          }
          break;
        case 'individual':
          recipientIds = recipients || [];
          break;
        default:
          recipientIds = recipients || [];
      }
    } else {
      recipientIds = recipients || [];
    }
    
    if (recipientIds.length === 0) {
      return res.status(400).json({ message: 'No recipients specified' });
    }
    
    // Prepare recipients array
    const recipientObjects = recipientIds.map(userId => ({
      user: userId,
      read: false
    }));
    
    const message = new Message({
      sender: req.userId,
      recipients: recipientObjects,
      subject,
      body,
      type: type || 'General',
      priority: priority ? 'High' : 'Normal',
      category: category || 'General',
      attachments,
      relatedClass,
      relatedStudent,
      scheduledFor,
      status: scheduledFor ? 'Scheduled' : 'Sent',
      sentAt: scheduledFor ? null : new Date()
    });
    
    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email')
      .populate('recipients.user', 'firstName lastName email');
    
    // Emit socket event to recipients
    const io = req.app.get('io');
    if (io) {
      recipientIds.forEach(recipientId => {
        io.to(`user-${recipientId}`).emit('new-message', populatedMessage);
      });
    }
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage,
      recipientCount: recipientIds.length
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/messages/broadcast
// @desc    Send broadcast message
// @access  Private (Admin/Principal/Teacher)
router.post('/broadcast', auth, authorize('admin', 'principal', 'teacher'), async (req, res) => {
  try {
    const { subject, body, targetGroup, priority, category } = req.body;
    // targetGroup: 'all-parents', 'all-teachers', 'all-students', 'class-X', 'year-X'
    
    let recipients = [];
    
    if (targetGroup === 'all-parents') {
      const users = await User.find({ role: 'parent', isActive: true });
      recipients = users.map(u => ({ user: u._id, read: false }));
    } else if (targetGroup === 'all-teachers') {
      const users = await User.find({ role: 'teacher', isActive: true });
      recipients = users.map(u => ({ user: u._id, read: false }));
    } else if (targetGroup === 'all-students') {
      const users = await User.find({ role: 'student', isActive: true });
      recipients = users.map(u => ({ user: u._id, read: false }));
    } else if (targetGroup.startsWith('class-')) {
      const classId = targetGroup.split('-')[1];
      const Class = require('../models/Class');
      const classData = await Class.findById(classId).populate('students');
      const studentUsers = await User.find({
        studentProfile: { $in: classData.students.map(s => s._id) }
      });
      recipients = studentUsers.map(u => ({ user: u._id, read: false }));
    } else if (targetGroup.startsWith('year-')) {
      const year = parseInt(targetGroup.split('-')[1]);
      const Student = require('../models/Student');
      const students = await Student.find({ currentYear: year });
      const studentUsers = await User.find({
        studentProfile: { $in: students.map(s => s._id) }
      });
      recipients = studentUsers.map(u => ({ user: u._id, read: false }));
    }
    
    const message = new Message({
      sender: req.userId,
      recipients,
      subject,
      body,
      type: 'Broadcast',
      priority,
      category,
      status: 'Sent',
      sentAt: new Date()
    });
    
    await message.save();
    
    res.status(201).json({
      message: `Broadcast message sent to ${recipients.length} recipients`,
      recipientCount: recipients.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/messages/:id/reply
// @desc    Reply to a message
// @access  Private
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { body, attachments } = req.body;
    
    const parentMessage = await Message.findById(req.params.id);
    
    if (!parentMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Create reply message
    const reply = new Message({
      sender: req.userId,
      recipients: [{ user: parentMessage.sender, read: false }],
      subject: `Re: ${parentMessage.subject}`,
      body,
      type: 'Individual',
      attachments,
      parentMessage: parentMessage._id,
      status: 'Sent',
      sentAt: new Date()
    });
    
    await reply.save();
    
    // Add reply to parent message
    parentMessage.replies.push(reply._id);
    await parentMessage.save();
    
    const populatedReply = await Message.findById(reply._id)
      .populate('sender', 'firstName lastName email');
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`user-${parentMessage.sender}`).emit('new-message', populatedReply);
    
    res.status(201).json({
      message: 'Reply sent successfully',
      data: populatedReply
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const recipient = message.recipients.find(
      r => r.user.toString() === req.userId
    );
    
    if (!recipient) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    recipient.read = true;
    recipient.readAt = new Date();
    await message.save();
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/messages/:id/star
// @desc    Star/unstar message
// @access  Private
router.put('/:id/star', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const recipient = message.recipients.find(
      r => r.user.toString() === req.userId
    );
    
    if (!recipient) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    recipient.starred = !recipient.starred;
    await message.save();
    
    res.json({ 
      message: `Message ${recipient.starred ? 'starred' : 'unstarred'}`,
      starred: recipient.starred
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/messages/:id/archive
// @desc    Archive/unarchive message
// @access  Private
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const recipient = message.recipients.find(
      r => r.user.toString() === req.userId
    );
    
    if (!recipient) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    recipient.archived = !recipient.archived;
    await message.save();
    
    res.json({ 
      message: `Message ${recipient.archived ? 'archived' : 'unarchived'}`,
      archived: recipient.archived
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only sender can delete
    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await message.deleteOne();
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      'recipients.user': req.userId,
      'recipients.read': false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

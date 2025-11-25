const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, floor, isAvailable, 
      page = 1, limit = 100 
    } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (floor) query.floor = parseInt(floor);
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    
    const rooms = await Room.find(query)
      .populate('bookings')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ floor: 1, roomNumber: 1 });
    
    const count = await Room.countDocuments(query);
    
    res.json({
      rooms,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('bookings')
      .populate('regularClasses.class')
      .populate('regularClasses.subject')
      .populate('regularClasses.teacher');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private (Admin only)
router.post('/', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    
    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Room number already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rooms/:id/availability
// @desc    Check room availability for a specific date/time
// @access  Private
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    
    const bookings = await RoomBooking.find({
      room: req.params.id,
      date: new Date(date),
      status: { $ne: 'Cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    
    res.json({
      isAvailable: bookings.length === 0,
      conflictingBookings: bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/rooms/:id/book
// @desc    Book a room
// @access  Private (Teacher/Admin)
router.post('/:id/book', auth, authorize('teacher', 'admin', 'principal'), async (req, res) => {
  try {
    const { date, startTime, endTime, purpose, notes } = req.body;
    
    // Check if room exists
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check availability
    const conflictingBookings = await RoomBooking.find({
      room: req.params.id,
      date: new Date(date),
      status: { $ne: 'Cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Room is not available at this time',
        conflictingBookings 
      });
    }
    
    // Create booking
    const booking = new RoomBooking({
      room: req.params.id,
      bookedBy: req.userId,
      date: new Date(date),
      startTime,
      endTime,
      purpose,
      notes,
      status: 'Confirmed'
    });
    
    await booking.save();
    
    // Add to room's bookings
    await Room.findByIdAndUpdate(req.params.id, {
      $push: { bookings: booking._id }
    });
    
    const populatedBooking = await RoomBooking.findById(booking._id)
      .populate('room')
      .populate('bookedBy', 'firstName lastName email');
    
    res.status(201).json({
      message: 'Room booked successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rooms/:id/bookings
// @desc    Get all bookings for a room
// @access  Private
router.get('/:id/bookings', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { room: req.params.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const bookings = await RoomBooking.find(query)
      .populate('bookedBy', 'firstName lastName email')
      .sort({ date: 1, startTime: 1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

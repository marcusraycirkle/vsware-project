const mongoose = require('mongoose');

// Teaghlach (House) System for St Patrick's Comprehensive School
const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Bride', 'Ide', 'Tola', 'Seanan', 'Padraig', 'Conaire']
  },
  nameIrish: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true // e.g., '#FF5733'
  },
  mascot: String,
  description: String,
  points: {
    type: Number,
    default: 0
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  houseCaptains: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    year: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    points: Number
  }],
  events: [{
    name: String,
    date: Date,
    result: String,
    points: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('House', houseSchema);

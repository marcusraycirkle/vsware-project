const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Exam', 'Test', 'Quiz', 'Assignment', 'Project', 'Practical', 'Oral', 'Continuous Assessment'],
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true
  },
  passingMarks: {
    type: Number,
    required: true
  },
  passingPercentage: {
    type: Number
  },
  submissionDate: {
    type: Date
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  weightage: {
    type: Number,
    default: 100
  },
  duration: {
    type: Number // in minutes
  },
  results: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    marksObtained: {
      type: Number,
      required: true
    },
    grade: {
      type: String
    },
    percentage: {
      type: Number
    },
    rank: {
      type: Number
    },
    isPassed: {
      type: Boolean
    },
    remarks: {
      type: String
    },
    submittedOn: {
      type: Date
    }
  }],
  syllabus: {
    type: String
  },
  instructions: {
    type: String
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Results Published', 'Cancelled'],
    default: 'Scheduled'
  },
  publishResults: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate grade and percentage before saving
assessmentSchema.pre('save', function(next) {
  if (this.results && this.results.length > 0) {
    this.results.forEach(result => {
      // Calculate percentage
      result.percentage = (result.marksObtained / this.maxMarks) * 100;
      
      // Determine if passed
      result.isPassed = result.marksObtained >= this.passingMarks;
      
      // Calculate grade
      const percentage = result.percentage;
      if (percentage >= 90) result.grade = 'A+';
      else if (percentage >= 80) result.grade = 'A';
      else if (percentage >= 70) result.grade = 'B+';
      else if (percentage >= 60) result.grade = 'B';
      else if (percentage >= 50) result.grade = 'C+';
      else if (percentage >= 40) result.grade = 'C';
      else if (percentage >= 33) result.grade = 'D';
      else result.grade = 'F';
    });
    
    // Calculate ranks
    const sortedResults = [...this.results].sort((a, b) => b.marksObtained - a.marksObtained);
    sortedResults.forEach((result, index) => {
      const originalResult = this.results.find(r => r.student.toString() === result.student.toString());
      if (originalResult) {
        originalResult.rank = index + 1;
      }
    });
  }
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);

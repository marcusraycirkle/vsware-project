const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Assessment = require('./models/Assessment');
const Behavior = require('./models/Behavior');
const Lesson = require('./models/Lesson');
const Timetable = require('./models/Timetable');
const Room = require('./models/Room');

dotenv.config();

/**
 * Enhanced seed script to populate database with comprehensive test data
 * Includes assessments, grades, lessons, behavioral records, and timetables
 */
const seedEnhancedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mispal');
    console.log('✅ Connected to MongoDB');

    // Fetch existing data
    const teacher = await User.findOne({ email: 'teacher@schoolware.com' });
    const demoStudent = await User.findOne({ email: 'student@schoolware.com' });
    const demoClass = await Class.findOne({ name: '1st Year A' });
    const allStudents = await Student.find().populate('user currentClass');
    const subjects = await Subject.find();
    const rooms = await Room.find();

    if (!demoClass || !teacher || !demoStudent || !demoClass) {
      console.error('❌ Required base data not found. Run seed.js first.');
      process.exit(1);
    }

    // ============================================
    // 1. CREATE COMPREHENSIVE TIMETABLES
    // ============================================
    console.log('📅 Creating comprehensive timetables...');
    
    // Clear existing timetables
    await Timetable.deleteMany({ class: demoClass._id });

    const periods = [
      { periodNumber: 1, startTime: '09:00', endTime: '10:30' },
      { periodNumber: 2, startTime: '10:45', endTime: '12:15' },
      { periodNumber: 3, startTime: '01:00', endTime: '02:30' },
      { periodNumber: 4, startTime: '02:30', endTime: '04:00' }
    ];

    const daySchedules = [
      {
        day: 'Monday',
        periods: [
          {
            periodNumber: 1,
            subject: subjects[0]?._id, // Mathematics
            teacher: teacher._id,
            room: '101',
            startTime: '09:00',
            endTime: '10:30',
            isBreak: false
          },
          {
            periodNumber: 2,
            subject: subjects[1]?._id, // English
            teacher: teacher._id,
            room: '205',
            startTime: '10:45',
            endTime: '12:15',
            isBreak: false
          },
          {
            periodNumber: 3,
            subject: subjects[4]?._id, // Computer Science or similar
            teacher: teacher._id,
            room: 'IT Lab',
            startTime: '01:00',
            endTime: '02:30',
            isBreak: false
          }
        ]
      },
      {
        day: 'Tuesday',
        periods: [
          {
            periodNumber: 1,
            subject: subjects[2]?._id, // Science/Biology
            teacher: teacher._id,
            room: 'Lab 205',
            startTime: '09:00',
            endTime: '10:30',
            isBreak: false
          },
          {
            periodNumber: 3,
            subject: subjects[0]?._id, // Mathematics
            teacher: teacher._id,
            room: '101',
            startTime: '01:00',
            endTime: '02:30',
            isBreak: false
          }
        ]
      },
      {
        day: 'Wednesday',
        periods: [
          {
            periodNumber: 2,
            subject: subjects[2]?._id, // Science/Chemistry
            teacher: teacher._id,
            room: 'Lab 301',
            startTime: '10:45',
            endTime: '12:15',
            isBreak: false
          },
          {
            periodNumber: 3,
            subject: subjects[3]?._id, // Geography
            teacher: teacher._id,
            room: '103',
            startTime: '01:00',
            endTime: '02:30',
            isBreak: false
          }
        ]
      },
      {
        day: 'Thursday',
        periods: [
          {
            periodNumber: 1,
            subject: subjects[3]?._id, // History
            teacher: teacher._id,
            room: '302',
            startTime: '09:00',
            endTime: '10:30',
            isBreak: false
          },
          {
            periodNumber: 2,
            subject: subjects[1]?._id, // French
            teacher: teacher._id,
            room: '401',
            startTime: '10:45',
            endTime: '12:15',
            isBreak: false
          },
          {
            periodNumber: 4,
            subject: subjects[1]?._id, // Economics
            teacher: teacher._id,
            room: '201',
            startTime: '02:30',
            endTime: '04:00',
            isBreak: false
          }
        ]
      },
      {
        day: 'Friday',
        periods: [
          {
            periodNumber: 2,
            subject: subjects[5]?._id, // Physical Ed
            teacher: teacher._id,
            room: 'Sports Hall',
            startTime: '10:45',
            endTime: '12:15',
            isBreak: false
          },
          {
            periodNumber: 3,
            subject: subjects[5]?._id, // Art
            teacher: teacher._id,
            room: 'Studio A',
            startTime: '01:00',
            endTime: '02:30',
            isBreak: false
          }
        ]
      }
    ];

    const timetable = new Timetable({
      class: demoClass._id,
      teacher: teacher._id,
      academicYear: '2024-2025',
      term: 'Term 3',
      schedule: daySchedules,
      effectiveFrom: new Date('2024-01-01'),
      effectiveTo: new Date('2025-06-30'),
      status: 'Published',
      notes: 'Standard Term 3 Schedule'
    });

    await timetable.save();
    console.log('   ✅ Created comprehensive timetable');

    // ============================================
    // 2. CREATE COMPREHENSIVE ASSESSMENTS
    // ============================================
    console.log('📝 Creating assessments and grades...');

    const assessmentTypes = [
      {
        title: 'Mathematics Quiz - Chapter 5',
        type: 'Quiz',
        subject: subjects[0]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        date: new Date('2024-01-20'),
        maxMarks: 50,
        passingMarks: 25,
        passingPercentage: 50,
        weightage: 10,
        duration: 30,
        isVisible: true,
        status: 'Completed',
        results: [
          {
            student: allStudents[0]?._id,
            marksObtained: 45,
            grade: 'A',
            percentage: 90,
            feedback: 'Excellent work! Great understanding of concepts.',
            submittedAt: new Date('2024-01-20')
          },
          {
            student: allStudents[1]?._id,
            marksObtained: 38,
            grade: 'B+',
            percentage: 76,
            feedback: 'Good attempt, review some concepts.',
            submittedAt: new Date('2024-01-20')
          },
          {
            student: allStudents[2]?._id,
            marksObtained: 42,
            grade: 'A',
            percentage: 84,
            feedback: 'Outstanding performance!',
            submittedAt: new Date('2024-01-20')
          }
        ]
      },
      {
        title: 'English Essay: Climate Change',
        type: 'Assignment',
        subject: subjects[1]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        date: new Date('2024-01-25'),
        maxMarks: 100,
        passingMarks: 50,
        passingPercentage: 50,
        weightage: 20,
        submissionDate: new Date('2024-02-01'),
        isVisible: true,
        status: 'In Progress',
        results: [
          {
            student: allStudents[0]?._id,
            marksObtained: 88,
            grade: 'A',
            percentage: 88,
            feedback: 'Well-structured essay with excellent arguments.',
            submittedAt: new Date('2024-01-30')
          }
        ]
      },
      {
        title: 'Science Midterm Exam',
        type: 'Exam',
        subject: subjects[2]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        date: new Date('2024-02-05'),
        maxMarks: 100,
        passingMarks: 40,
        passingPercentage: 40,
        weightage: 30,
        duration: 120,
        syllabus: 'Chapters 1-6: Matter, Energy, Forces',
        instructions: 'Answer all questions. Show all working.',
        isVisible: true,
        status: 'Scheduled'
      },
      {
        title: 'History Project Presentation',
        type: 'Project',
        subject: subjects[3]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        date: new Date('2024-02-10'),
        maxMarks: 80,
        passingMarks: 40,
        passingPercentage: 50,
        weightage: 15,
        submissionDate: new Date('2024-02-08'),
        isVisible: true,
        status: 'In Progress',
        results: [
          {
            student: allStudents[1]?._id,
            marksObtained: 72,
            grade: 'A',
            percentage: 90,
            feedback: 'Excellent research and presentation skills.',
            submittedAt: new Date('2024-02-08')
          }
        ]
      },
      {
        title: 'Geography Map Exercise',
        type: 'Assignment',
        subject: subjects[3]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        date: new Date('2024-01-22'),
        maxMarks: 40,
        passingMarks: 20,
        passingPercentage: 50,
        weightage: 10,
        submissionDate: new Date('2024-02-01'),
        isVisible: true,
        status: 'Completed',
        results: [
          {
            student: allStudents[2]?._id,
            marksObtained: 38,
            grade: 'A',
            percentage: 95,
            feedback: 'Perfect! Beautiful and accurate map work.',
            submittedAt: new Date('2024-01-31')
          }
        ]
      }
    ];

    for (const assessmentData of assessmentTypes) {
      const assessment = new Assessment(assessmentData);
      await assessment.save();
    }
    console.log('   ✅ Created 5 assessments with grades');

    // ============================================
    // 3. CREATE COMPREHENSIVE LESSONS/ASSIGNMENTS
    // ============================================
    console.log('📚 Creating lessons and course materials...');

    const lessonData = [
      {
        title: 'Linear Equations - Introduction',
        description: 'Understanding and solving linear equations. This lesson covers the fundamentals of algebraic manipulation.',
        subject: subjects[0]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        type: 'Lecture',
        date: new Date('2024-01-15'),
        status: 'Completed',
        materials: [
          {
            title: 'Presentation Slides',
            type: 'PDF',
            url: '/materials/linear-equations-slides.pdf',
            uploadedAt: new Date('2024-01-14')
          },
          {
            title: 'Example Problems',
            type: 'Document',
            url: '/materials/linear-equations-examples.pdf',
            uploadedAt: new Date('2024-01-14')
          }
        ],
        homeworkTitle: 'Linear Equations Problem Set',
        homeworkDescription: 'Complete exercises 1-20 from the worksheet',
        dueDate: new Date('2024-01-17'),
        attachments: [
          {
            name: 'homework-worksheet.pdf',
            url: '/materials/homework-worksheet.pdf'
          }
        ]
      },
      {
        title: 'Quadratic Functions Deep Dive',
        description: 'Learn about quadratic functions, parabolas, and their applications in real-world problems.',
        subject: subjects[0]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        type: 'Interactive',
        date: new Date('2024-01-22'),
        status: 'Completed',
        materials: [
          {
            title: 'Interactive GeoGebra Applet',
            type: 'Link',
            url: 'https://www.geogebra.org/m/graphing-quadratics',
            uploadedAt: new Date('2024-01-21')
          },
          {
            title: 'Video Tutorial',
            type: 'Video',
            url: '/videos/quadratic-intro.mp4',
            uploadedAt: new Date('2024-01-21')
          }
        ],
        homeworkTitle: 'Quadratic Analysis Project',
        homeworkDescription: 'Analyze 5 real-world scenarios using quadratic equations',
        dueDate: new Date('2024-01-29'),
        attachments: [
          {
            name: 'project-guidelines.pdf',
            url: '/materials/quadratic-project.pdf'
          }
        ]
      },
      {
        title: 'English Literature: Shakespeare Intro',
        description: 'Introduction to the works and life of William Shakespeare. Overview of his major plays and sonnets.',
        subject: subjects[1]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        type: 'Lecture',
        date: new Date('2024-01-18'),
        status: 'Completed',
        materials: [
          {
            title: 'Shakespeare Biography',
            type: 'PDF',
            url: '/materials/shakespeare-bio.pdf',
            uploadedAt: new Date('2024-01-17')
          },
          {
            title: 'Major Works List',
            type: 'Document',
            url: '/materials/shakespeare-works.docx',
            uploadedAt: new Date('2024-01-17')
          }
        ],
        homeworkTitle: 'Read Romeo and Juliet Act 1',
        homeworkDescription: 'Read Act 1 and write a one-page summary of key events',
        dueDate: new Date('2024-01-25'),
        attachments: [
          {
            name: 'romeo-and-juliet-act1.pdf',
            url: '/materials/rj-act1.pdf'
          }
        ]
      },
      {
        title: 'Cell Biology: Structure and Function',
        description: 'Comprehensive study of cell structure, organelles, and their functions. Plant vs Animal cells.',
        subject: subjects[2]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        type: 'Lab Work',
        date: new Date('2024-01-20'),
        status: 'Completed',
        materials: [
          {
            title: 'Lab Procedure',
            type: 'PDF',
            url: '/materials/cell-lab-procedure.pdf',
            uploadedAt: new Date('2024-01-19')
          },
          {
            title: 'Microscope Safety Guide',
            type: 'PDF',
            url: '/materials/microscope-safety.pdf',
            uploadedAt: new Date('2024-01-19')
          }
        ],
        homeworkTitle: 'Lab Report',
        homeworkDescription: 'Complete the lab report with observations and diagrams',
        dueDate: new Date('2024-01-27'),
        attachments: [
          {
            name: 'lab-report-template.docx',
            url: '/materials/lab-template.docx'
          }
        ]
      },
      {
        title: 'World War I: Causes and Consequences',
        description: 'Historical analysis of WWI causes, major battles, and its global impact.',
        subject: subjects[3]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        type: 'Lecture',
        date: new Date('2024-01-19'),
        status: 'Completed',
        materials: [
          {
            title: 'Timeline of Events',
            type: 'PDF',
            url: '/materials/wwi-timeline.pdf',
            uploadedAt: new Date('2024-01-18')
          },
          {
            title: 'Primary Sources Collection',
            type: 'Document',
            url: '/materials/primary-sources.pdf',
            uploadedAt: new Date('2024-01-18')
          }
        ],
        homeworkTitle: 'World War I Essay',
        homeworkDescription: 'Write 1500 words analyzing the major causes of WWI',
        dueDate: new Date('2024-02-02'),
        attachments: [
          {
            name: 'essay-guidelines.docx',
            url: '/materials/essay-guidelines.docx'
          }
        ]
      },
      {
        title: 'Physical Education: Volleyball Fundamentals',
        description: 'Basic volleyball skills including serving, passing, spiking, and basic team strategies.',
        subject: subjects[5]?._id,
        class: demoClass._id,
        teacher: teacher._id,
        academicYear: '2024-2025',
        term: 'Term 3',
        type: 'Practical',
        date: new Date('2024-01-23'),
        status: 'Ongoing',
        materials: [
          {
            title: 'Volleyball Rules',
            type: 'PDF',
            url: '/materials/volleyball-rules.pdf',
            uploadedAt: new Date('2024-01-22')
          },
          {
            title: 'Technique Demonstration Video',
            type: 'Video',
            url: '/videos/volleyball-technique.mp4',
            uploadedAt: new Date('2024-01-22')
          }
        ],
        homeworkTitle: 'Practice Log',
        homeworkDescription: 'Keep a log of practice outside of class',
        dueDate: new Date('2024-02-10'),
        attachments: []
      }
    ];

    for (const lesson of lessonData) {
      const newLesson = new Lesson(lesson);
      await newLesson.save();
    }
    console.log('   ✅ Created 6 lessons with course materials');

    // ============================================
    // 4. CREATE COMPREHENSIVE BEHAVIOR RECORDS
    // ============================================
    console.log('⭐ Creating detailed behavior records...');

    const behaviorRecords = [
      {
        student: allStudents[0]._id,
        class: demoClass._id,
        type: 'Positive',
        category: 'Participation',
        severity: 'Low',
        title: 'Excellent participation in class discussion',
        description: 'Demonstrated thoughtful engagement during mathematics lesson on quadratic equations. Provided clear explanations to peers.',
        date: new Date('2024-01-23'),
        points: 2,
        reportedBy: teacher._id,
        followUpRequired: false,
        actionTaken: 'Class recognition'
      },
      {
        student: allStudents[0]._id,
        class: demoClass._id,
        type: 'Positive',
        category: 'Leadership',
        severity: 'Low',
        title: 'Peer tutoring initiative',
        description: 'Voluntarily helped struggling classmates understand linear equations. Showed great patience and empathy.',
        date: new Date('2024-01-21'),
        points: 3,
        reportedBy: teacher._id,
        followUpRequired: false,
        actionTaken: 'Formal acknowledgment'
      },
      {
        student: allStudents[1]._id,
        class: demoClass._id,
        type: 'Negative',
        category: 'Late',
        severity: 'Low',
        title: 'Late arrival to class',
        description: 'Student arrived 10 minutes late to mathematics period without prior notification.',
        date: new Date('2024-01-22'),
        points: -1,
        reportedBy: teacher._id,
        followUpRequired: false,
        actionTaken: 'Verbal reminder'
      },
      {
        student: allStudents[1]._id,
        class: demoClass._id,
        type: 'Positive',
        category: 'Academic',
        severity: 'Low',
        title: 'High quality project submission',
        description: 'History project showed excellent research, creativity, and attention to detail.',
        date: new Date('2024-01-20'),
        points: 2,
        reportedBy: teacher._id,
        followUpRequired: false,
        actionTaken: 'Shared with class'
      },
      {
        student: allStudents[2]._id,
        class: demoClass._id,
        type: 'Positive',
        category: 'Sportsmanship',
        severity: 'Low',
        title: 'Great team spirit in PE',
        description: 'Demonstrated excellent teamwork and sportsmanship during volleyball match. Encouraged teammates throughout.',
        date: new Date('2024-01-23'),
        points: 1,
        reportedBy: teacher._id,
        followUpRequired: false,
        actionTaken: 'Team recognition'
      },
      {
        student: allStudents[0]._id,
        class: demoClass._id,
        type: 'Negative',
        category: 'Conduct',
        severity: 'Medium',
        title: 'Disruption during lesson',
        description: 'Student was observed talking during instructions and distracting nearby classmates.',
        date: new Date('2024-01-19'),
        points: -2,
        reportedBy: teacher._id,
        followUpRequired: true,
        followUpDate: new Date('2024-01-25'),
        actionTaken: 'Parental contact required'
      },
      {
        student: allStudents[2]._id,
        class: demoClass._id,
        type: 'Positive',
        category: 'Attendance',
        severity: 'Low',
        title: 'Perfect attendance this term',
        description: 'Student has maintained 100% attendance record throughout the term.',
        date: new Date('2024-01-24'),
        points: 2,
        reportedBy: teacher._id,
        followUpRequired: false,
        actionTaken: 'Certificate awarded'
      }
    ];

    for (const record of behaviorRecords) {
      const behavior = new Behavior(record);
      await behavior.save();
      // Update student behavior array
      await Student.findByIdAndUpdate(record.student, { $push: { behavior: behavior._id } });
    }
    console.log('   ✅ Created 7 behavior records');

    // ============================================
    // 5. PRINT SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ ENHANCED SEED DATA CREATED SUCCESSFULLY');
    console.log('='.repeat(50));
    console.log('\n📊 Created:');
    console.log('   • 1 comprehensive timetable with full weekly schedule');
    console.log('   • 5 assessments (Quiz, Assignment, Project, Exam)');
    console.log('   • Assessment results with grades for multiple students');
    console.log('   • 6 lessons with course materials and homework');
    console.log('   • 7 behavior records (positive and negative)');
    console.log('\n🔐 Demo Credentials:');
    console.log('   • Student: student@schoolware.com / Password: student123');
    console.log('   • Teacher: teacher@schoolware.com / Password: teacher24');
    console.log('   • Admin: admin@schoolware.com / Password: ad24');
    console.log('\n📌 Features Now Available:');
    console.log('   ✓ Calendar/Timetable view with all classes');
    console.log('   ✓ Grades section with assessment results');
    console.log('   ✓ Behavior records with positive/negative notes');
    console.log('   ✓ Assignments with course materials');
    console.log('   ✓ Attendance tracking');
    console.log('   ✓ Messages and announcements');
    console.log('\n' + '='.repeat(50) + '\n');

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the seed function
seedEnhancedData();

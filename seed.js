const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Parent = require('./models/Parent');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Room = require('./models/Room');
const RoomBooking = require('./models/RoomBooking');
const Timetable = require('./models/Timetable');
const Attendance = require('./models/Attendance');
const Assessment = require('./models/Assessment');
const Behavior = require('./models/Behavior');
const Period = require('./models/Period');
const Lesson = require('./models/Lesson');

dotenv.config();

const sampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Parent.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Room.deleteMany({});
    await RoomBooking.deleteMany({});
    await Attendance.deleteMany({});
    await Assessment.deleteMany({});
    await Behavior.deleteMany({});
    await Period.deleteMany({});
    await Lesson.deleteMany({});
    await Timetable.deleteMany({});

    // Create Admin User
    console.log('👤 Creating admin user...');
    const admin = new User({
      email: 'admin@schoolware.com',
      password: 'ad24',
      pin: '1234',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      roleHierarchy: 'Principal',
      phoneNumber: '+353 1 234 5678'
    });
    await admin.save();
    console.log('   ✅ Admin created: admin@schoolware.com / ad24 / PIN: 1234');

    // Create Secretary User
    console.log('👤 Creating secretary user...');
    const secretary = new User({
      email: 'secretary@schoolware.com',
      password: 'sec24',
      pin: '4321',
      firstName: 'Front',
      lastName: 'Office',
      role: 'secretary',
      roleHierarchy: 'Secretary',
      phoneNumber: '+353 1 234 5679'
    });
    await secretary.save();
    console.log('   ✅ Secretary created: secretary@schoolware.com / sec24 / PIN: 4321');

    // Create Subjects
    console.log('📚 Creating subjects...');
    const subjects = [
      { name: 'Mathematics', code: 'MATH', department: 'Mathematics', years: [1, 2, 3, 4, 5, 6], isCore: true },
      { name: 'English', code: 'ENG', department: 'Languages', years: [1, 2, 3, 4, 5, 6], isCore: true },
      { name: 'Science', code: 'SCI', department: 'Science', years: [1, 2, 3, 4, 5, 6], isCore: true },
      { name: 'History', code: 'HIST', department: 'Humanities', years: [1, 2, 3, 4, 5, 6], isCore: false },
      { name: 'Geography', code: 'GEO', department: 'Humanities', years: [1, 2, 3, 4, 5, 6], isCore: false },
      { name: 'Physical Education', code: 'PE', department: 'Sports', years: [1, 2, 3, 4, 5, 6], isCore: true }
    ];
    
    const createdSubjects = [];
    for (const subject of subjects) {
      const newSubject = new Subject(subject);
      await newSubject.save();
      createdSubjects.push(newSubject);
    }
    console.log(`   ✅ Created ${createdSubjects.length} subjects`);

    // Create Teachers
    console.log('👨‍🏫 Creating teachers...');
    const teachers = [
      {
        email: 'teacher@schoolware.com',
        password: 'teacher24',
        firstName: 'Demo',
        lastName: 'Teacher',
        role: 'teacher',
        dateOfBirth: new Date('1982-02-10'),
        gender: 'Female',
        department: 'Mathematics',
        designation: 'Teacher',
        subjects: [createdSubjects[0]._id]
      },
      {
        email: 'john.smith@schoolware.com',
        password: 'teacher123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'teacher',
        dateOfBirth: new Date('1980-05-15'),
        gender: 'Male',
        department: 'Mathematics',
        designation: 'Senior Teacher',
        subjects: [createdSubjects[0]._id]
      },
      {
        email: 'mary.jones@schoolware.com',
        password: 'teacher123',
        firstName: 'Mary',
        lastName: 'Jones',
        role: 'teacher',
        dateOfBirth: new Date('1985-08-22'),
        gender: 'Female',
        department: 'Languages',
        designation: 'Teacher',
        subjects: [createdSubjects[1]._id]
      },
      {
        email: 'david.brown@schoolware.com',
        password: 'teacher123',
        firstName: 'David',
        lastName: 'Brown',
        role: 'teacher',
        dateOfBirth: new Date('1978-03-10'),
        gender: 'Male',
        department: 'Science',
        designation: 'Head of Department',
        subjects: [createdSubjects[2]._id]
      }
    ];

    const createdTeachers = [];
    for (const teacher of teachers) {
      const user = new User({
        email: teacher.email,
        password: teacher.password,
        pin: '1234',
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: teacher.role,
        roleHierarchy: 'Mid',
        phoneNumber: '+353 1 ' + Math.floor(Math.random() * 9000000 + 1000000)
      });
      await user.save();

      const isPrimaryTeacher = teacher.email === 'teacher@schoolware.com';
      const teacherProfile = new Teacher({
        user: user._id,
        teacherId: `TCH${1000 + createdTeachers.length}`,
        employeeId: `EMP${2000 + createdTeachers.length}`,
        dateOfBirth: teacher.dateOfBirth,
        gender: teacher.gender,
        department: teacher.department,
        designation: teacher.designation,
        subjects: teacher.subjects,
        permissions: {
          canManageUsers: false,
          canManageTeachers: false,
          canManageStudents: false,
          canManageClasses: isPrimaryTeacher,
          canEditTimetable: true,
          canViewAllReports: isPrimaryTeacher,
          canManagePayments: false,
          canManageRooms: false,
          canEditStudentInfo: false,
          canEditStudentTimetable: false,
          canViewReports: true,
          canManageAttendance: true,
          canManageBehavior: true,
          canManageAssessments: true,
          canSendMail: true,
          canBookRooms: true
        }
      });
      await teacherProfile.save();

      user.teacherProfile = teacherProfile._id;
      await user.save();

      createdTeachers.push(teacherProfile);
    }
    console.log(`   ✅ Created ${createdTeachers.length} teachers`);

    // Create Classes
    console.log('🎓 Creating classes...');
    const classes = [
      {
        name: '1st Year A',
        year: 1,
        yearGroup: 'First Year',
        section: 'A',
        academicYear: '2024-2025',
        classTeacher: createdTeachers[0]._id,
        capacity: 30,
        room: 'Room 101',
        subjects: [createdSubjects[0]._id, createdSubjects[1]._id, createdSubjects[2]._id]
      },
      {
        name: '2nd Year A',
        year: 2,
        yearGroup: 'Second Year',
        section: 'A',
        academicYear: '2024-2025',
        classTeacher: createdTeachers[1]._id,
        capacity: 30,
        room: 'Room 201',
        subjects: [createdSubjects[0]._id, createdSubjects[1]._id, createdSubjects[2]._id]
      }
    ];

    const createdClasses = [];
    for (const classData of classes) {
      const newClass = new Class(classData);
      await newClass.save();
      createdClasses.push(newClass);
    }
    console.log(`   ✅ Created ${createdClasses.length} classes`);

    // Create Rooms
    console.log('🏫 Creating rooms...');
    const rooms = [
      { roomNumber: 'Room 101', roomName: 'Room 101', category: 'General Classrooms', floor: 1, capacity: 30 },
      { roomNumber: 'Room 201', roomName: 'Room 201', category: 'General Classrooms', floor: 2, capacity: 30 },
      { roomNumber: 'Lab 1', roomName: 'Science Lab 1', category: 'Science Labs', floor: 1, capacity: 24 },
      { roomNumber: 'Gym', roomName: 'Sports Hall', category: 'PE/Sports Hall', floor: 0, capacity: 40 }
    ];

    const createdRooms = [];
    for (const room of rooms) {
      const newRoom = new Room(room);
      await newRoom.save();
      createdRooms.push(newRoom);
    }
    console.log(`   ✅ Created ${createdRooms.length} rooms`);

    // Create Periods
    console.log('⏰ Creating periods...');
    const periods = [
      { name: 'Period 1', startTime: '09:00', endTime: '09:40', order: 1 },
      { name: 'Period 2', startTime: '09:40', endTime: '10:20', order: 2 },
      { name: 'Period 3', startTime: '10:20', endTime: '11:00', order: 3 },
      { name: 'Break', startTime: '11:00', endTime: '11:15', order: 4, isBreak: true },
      { name: 'Period 4', startTime: '11:15', endTime: '11:55', order: 5 },
      { name: 'Period 5', startTime: '11:55', endTime: '12:35', order: 6 },
      { name: 'Lunch', startTime: '12:35', endTime: '13:15', order: 7, isBreak: true },
      { name: 'Period 6', startTime: '13:15', endTime: '13:55', order: 8 },
      { name: 'Period 7', startTime: '13:55', endTime: '14:35', order: 9 }
    ];

    const createdPeriods = [];
    for (const period of periods) {
      const newPeriod = new Period(period);
      await newPeriod.save();
      createdPeriods.push(newPeriod);
    }
    console.log(`   ✅ Created ${createdPeriods.length} periods`);

    // Create Students and Parents
    console.log('👨‍🎓 Creating students and parents...');
    const studentsData = [
      {
        firstName: 'Demo',
        lastName: 'Student',
        email: 'student@schoolware.com',
        dateOfBirth: new Date('2010-01-10'),
        gender: 'Female',
        currentYear: 1,
        yearName: 'First Year',
        yearGroup: 'First Year',
        house: 'Bride',
        currentClass: createdClasses[0]._id,
        parentEmail: 'parent.demo@email.com',
        parentFirstName: 'Alex',
        parentLastName: 'Student'
      },
      {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@student.schoolware.com',
        dateOfBirth: new Date('2010-01-15'),
        gender: 'Male',
        currentYear: 1,
        yearName: 'First Year',
        yearGroup: 'First Year',
        house: 'Bride',
        currentClass: createdClasses[0]._id,
        parentEmail: 'parent.wilson@email.com',
        parentFirstName: 'Robert',
        parentLastName: 'Wilson'
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@student.schoolware.com',
        dateOfBirth: new Date('2010-03-22'),
        gender: 'Female',
        currentYear: 1,
        yearName: 'First Year',
        yearGroup: 'First Year',
        house: 'Ide',
        currentClass: createdClasses[0]._id,
        parentEmail: 'parent.davis@email.com',
        parentFirstName: 'Sarah',
        parentLastName: 'Davis'
      },
      {
        firstName: 'Michael',
        lastName: 'Murphy',
        email: 'michael.murphy@student.schoolware.com',
        dateOfBirth: new Date('2009-06-10'),
        gender: 'Male',
        currentYear: 2,
        yearName: 'Second Year',
        yearGroup: 'Second Year',
        house: 'Tola',
        currentClass: createdClasses[1]._id,
        parentEmail: 'parent.murphy@email.com',
        parentFirstName: 'Patrick',
        parentLastName: 'Murphy'
      }
    ];

    for (let i = 0; i < studentsData.length; i++) {
      const data = studentsData[i];

      // Create student user
      const studentUser = new User({
        email: data.email,
        pin: '1234',
        password: 'student123',
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'student',
        roleHierarchy: 'Student'
      });
      await studentUser.save();

      // Create student profile
      const student = new Student({
        user: studentUser._id,
        studentId: `STD${1000 + i}`,
        admissionNumber: `ADM2024${1000 + i}`,
        vswareId: `VSW${1000 + i}`,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        currentYear: data.currentYear,
        yearName: data.yearName,
        yearGroup: data.yearGroup,
        house: data.house,
        currentClass: data.currentClass,
        admissionDate: new Date('2024-09-01')
      });
      await student.save();

      studentUser.studentProfile = student._id;
      await studentUser.save();

      // Add student to class
      await Class.findByIdAndUpdate(data.currentClass, {
        $push: { students: student._id }
      });

      // Create parent user
      const parentUser = new User({
        email: data.parentEmail,
        pin: '1234',
        password: 'parent123',
        firstName: data.parentFirstName,
        lastName: data.parentLastName,
        role: 'parent',
        roleHierarchy: 'Parent'
      });
      await parentUser.save();

      // Create parent profile
      const parent = new Parent({
        user: parentUser._id,
        parentId: `PAR${1000 + i}`,
        relationship: 'Father',
        children: [student._id],
        isPrimaryContact: true
      });
      await parent.save();

      parentUser.parentProfile = parent._id;
      await parentUser.save();

      // Link parent to student
      student.parents.push(parent._id);
      await student.save();
    }
    console.log(`   ✅ Created ${studentsData.length} students and parents`);

    // Create Behavior Logs
    console.log('⭐ Creating behavior logs...');
    const allStudents = await Student.find().populate('user');
    const behaviorLogs = [
      {
        student: allStudents[0]._id,
        class: createdClasses[0]._id,
        type: 'Positive',
        category: 'Participation',
        severity: 'Low',
        title: 'Excellent participation',
        description: 'Contributed thoughtful answers in class.',
        date: new Date(),
        points: 1,
        reportedBy: admin._id
      },
      {
        student: allStudents[1]._id,
        class: createdClasses[0]._id,
        type: 'Negative',
        category: 'Late',
        severity: 'Low',
        title: 'Late arrival',
        description: 'Arrived 10 minutes late.',
        date: new Date(),
        points: -1,
        reportedBy: admin._id
      },
      {
        student: allStudents[2]._id,
        class: createdClasses[1]._id,
        type: 'Positive',
        category: 'Leadership',
        severity: 'Low',
        title: 'Helped classmates',
        description: 'Assisted peers during group work.',
        date: new Date(),
        points: 1,
        reportedBy: admin._id
      }
    ];

    for (const entry of behaviorLogs) {
      const log = new Behavior(entry);
      await log.save();
      await Student.findByIdAndUpdate(entry.student, { $push: { behavior: log._id } });
    }
    console.log('   ✅ Created behavior logs');

    // Create Attendance Records
    console.log('🗓️  Creating attendance records...');
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const attendanceEntries = [
      {
        student: allStudents[0]._id,
        class: createdClasses[0]._id,
        date: today,
        status: 'Present',
        period: 'Class 1',
        subject: createdSubjects[0]._id,
        markedBy: admin._id,
        notes: 'On time'
      },
      {
        student: allStudents[1]._id,
        class: createdClasses[0]._id,
        date: today,
        status: 'Late',
        period: 'Class 1',
        subject: createdSubjects[0]._id,
        markedBy: admin._id,
        notes: 'Late by 5 minutes'
      },
      {
        student: allStudents[0]._id,
        class: createdClasses[0]._id,
        date: yesterday,
        status: 'Present',
        period: 'Class 2',
        subject: createdSubjects[1]._id,
        markedBy: admin._id
      },
      {
        student: allStudents[1]._id,
        class: createdClasses[0]._id,
        date: yesterday,
        status: 'Absent',
        period: 'Class 2',
        subject: createdSubjects[1]._id,
        markedBy: admin._id,
        notes: 'Sick'
      }
    ];

    for (const entry of attendanceEntries) {
      const record = new Attendance(entry);
      await record.save();
      await Student.findByIdAndUpdate(entry.student, { $push: { attendance: record._id } });
    }
    console.log('   ✅ Created attendance records');

    // Create Assignments (Assessments)
    console.log('📝 Creating assignments...');
    const assignment = new Assessment({
      title: 'Algebra Assignment 1',
      type: 'Assignment',
      subject: createdSubjects[0]._id,
      class: createdClasses[0]._id,
      teacher: createdTeachers[0]._id,
      academicYear: '2024-2025',
      term: 'Term 1',
      date: new Date(),
      submissionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxMarks: 100,
      passingMarks: 40,
      passingPercentage: 40,
      isVisible: true,
      syllabus: 'Linear equations and inequalities',
      instructions: 'Complete all questions. Show your working.',
      status: 'Scheduled'
    });
    await assignment.save();
    console.log('   ✅ Created assignments');

    // Create Lessons
    console.log('📘 Creating lessons...');
    const lessonEntries = [
      {
        class: createdClasses[0]._id,
        teacher: createdTeachers[0]._id,
        subject: createdSubjects[0]._id,
        room: createdRooms[0]._id,
        period: createdPeriods[0]._id,
        dayOfWeek: 'Monday',
        startDate: new Date('2024-09-02'),
        isRecurring: true,
        notes: 'Intro to Algebra'
      },
      {
        class: createdClasses[1]._id,
        teacher: createdTeachers[1]._id,
        subject: createdSubjects[1]._id,
        room: createdRooms[1]._id,
        period: createdPeriods[1]._id,
        dayOfWeek: 'Tuesday',
        startDate: new Date('2024-09-03'),
        isRecurring: true,
        notes: 'Essay writing'
      }
    ];

    for (const entry of lessonEntries) {
      const lesson = new Lesson(entry);
      await lesson.save();
    }
    console.log('   ✅ Created lessons');

    // Create Room Bookings (One-off + Recurring)
    console.log('🏷️  Creating room bookings...');
    const bookingOneOff = new RoomBooking({
      room: createdRooms[2]._id,
      bookedBy: admin._id,
      date: new Date('2024-09-10'),
      period: 'Class 3',
      startTime: '10:20',
      endTime: '11:00',
      purpose: 'Exam',
      class: createdClasses[0]._id,
      status: 'Approved'
    });
    await bookingOneOff.save();

    const bookingRecurring = new RoomBooking({
      room: createdRooms[3]._id,
      bookedBy: admin._id,
      date: new Date('2024-09-05'),
      period: 'Class 6',
      startTime: '12:35',
      endTime: '13:15',
      purpose: 'Class',
      class: createdClasses[1]._id,
      status: 'Approved',
      recurringBooking: {
        isRecurring: true,
        frequency: 'Weekly',
        endDate: new Date('2024-12-01')
      }
    });
    await bookingRecurring.save();

    await Room.findByIdAndUpdate(createdRooms[2]._id, { $push: { bookings: bookingOneOff._id } });
    await Room.findByIdAndUpdate(createdRooms[3]._id, { $push: { bookings: bookingRecurring._id } });
    console.log('   ✅ Created room bookings');
// Create Timetables for Classes
    console.log('📅 Creating timetables...');
    
    // Define period times
    const periodTimes = [
      { periodNumber: 1, startTime: '09:00', endTime: '09:40' },
      { periodNumber: 2, startTime: '09:40', endTime: '10:20' },
      { periodNumber: 3, startTime: '10:20', endTime: '11:00' },
      { periodNumber: 4, startTime: '11:20', endTime: '12:00' }, // After break
      { periodNumber: 5, startTime: '12:00', endTime: '12:40' },
      { periodNumber: 6, startTime: '13:40', endTime: '14:20' }, // After lunch
      { periodNumber: 7, startTime: '14:20', endTime: '15:00' }
    ];

    // Timetable for 1st Year A (Class 0)
    const timetable1A = new Timetable({
      class: createdClasses[0]._id,
      teacher: createdTeachers[0]._id,
      academicYear: '2024-2025',
      term: 'Term 1',
      schedule: [
        {
          day: 'Monday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 101', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '11:20', endTime: '12:00', isBreak: false },
            { periodNumber: 5, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Tuesday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 101', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Wednesday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 101', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 101', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Thursday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 101', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Friday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 101', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 101', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 101', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 101', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '14:20', endTime: '15:00' }
          ]
        }
      ],
      effectiveFrom: new Date('2024-09-01'),
      status: 'Published'
    });
    await timetable1A.save();

    // Timetable for 2nd Year A (Class 1)
    const timetable2A = new Timetable({
      class: createdClasses[1]._id,
      teacher: createdTeachers[1]._id,
      academicYear: '2024-2025',
      term: 'Term 1',
      schedule: [
        {
          day: 'Monday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 201', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Tuesday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 201', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Wednesday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 201', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 201', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Thursday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 201', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '14:20', endTime: '15:00' }
          ]
        },
        {
          day: 'Friday',
          periods: [
            { periodNumber: 1, subject: createdSubjects[0]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '09:00', endTime: '09:40' },
            { periodNumber: 2, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '09:40', endTime: '10:20' },
            { periodNumber: 3, subject: createdSubjects[3]._id, teacher: createdTeachers[0]._id, room: 'Room 201', startTime: '10:20', endTime: '11:00' },
            { periodNumber: 4, subject: createdSubjects[2]._id, teacher: createdTeachers[2]._id, room: 'Room 201', startTime: '11:20', endTime: '12:00' },
            { periodNumber: 5, subject: createdSubjects[1]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '12:00', endTime: '12:40' },
            { periodNumber: 6, subject: createdSubjects[5]._id, teacher: createdTeachers[2]._id, room: 'Gym', startTime: '13:40', endTime: '14:20' },
            { periodNumber: 7, subject: createdSubjects[4]._id, teacher: createdTeachers[1]._id, room: 'Room 201', startTime: '14:20', endTime: '15:00' }
          ]
        }
      ],
      effectiveFrom: new Date('2024-09-01'),
      status: 'Published'
    });
    await timetable2A.save();

    await Teacher.findByIdAndUpdate(createdTeachers[0]._id, { timetable: timetable1A._id });
    await Teacher.findByIdAndUpdate(createdTeachers[1]._id, { timetable: timetable2A._id });
    await Class.findByIdAndUpdate(createdClasses[0]._id, { timetable: timetable1A._id });
    await Class.findByIdAndUpdate(createdClasses[1]._id, { timetable: timetable2A._id });

    console.log(`   ✅ Created 2 timetables for classes`);

    
    console.log('\n✅ Sample data created successfully!\n');
    console.log('=== LOGIN CREDENTIALS ===\n');
    console.log('Admin:');
    console.log('  Email: admin@schoolware.com');
    console.log('  Password: ad24');
    console.log('  PIN: 1234\n');
    console.log('Secretary:');
    console.log('  Email: secretary@schoolware.com');
    console.log('  Password: sec24');
    console.log('  PIN: 4321\n');
    console.log('Teachers:');
    console.log('  Email: john.smith@schoolware.com');
    console.log('  Email: mary.jones@schoolware.com');
    console.log('  Email: david.brown@schoolware.com');
    console.log('  Password: teacher123');
    console.log('  PIN: 1234\n');
    console.log('Students:');
    console.log('  Email: james.wilson@student.schoolware.com');
    console.log('  Email: emma.davis@student.schoolware.com');
    console.log('  Email: michael.murphy@student.schoolware.com');
    console.log('  Password: student123');
    console.log('  PIN: 1234\n');
    console.log('  Quick Test Student: james.wilson@student.schoolware.com / student123');
    console.log('Parents:');
    console.log('  Email: parent.wilson@email.com');
    console.log('  Email: parent.davis@email.com');
    console.log('  Email: parent.murphy@email.com');
    console.log('  Password: parent123');
    console.log('  PIN: 1234\n');
    console.log('  Quick Test Parent: parent.wilson@email.com / parent123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

sampleData();

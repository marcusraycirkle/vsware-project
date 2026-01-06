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
    await Timetable.deleteMany({});

    // Create Admin User
    console.log('👤 Creating admin user...');
    const admin = new User({
      email: 'admin@schoolware.com',
      password: 'admin123',
      pin: '1234',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      phoneNumber: '+353 1 234 5678'
    });
    await admin.save();
    console.log('   ✅ Admin created: admin@schoolware.com / admin123 / PIN: 1234');

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
        phoneNumber: '+353 1 ' + Math.floor(Math.random() * 9000000 + 1000000)
      });
      await user.save();

      const teacherProfile = new Teacher({
        user: user._id,
        teacherId: `TCH${1000 + createdTeachers.length}`,
        employeeId: `EMP${2000 + createdTeachers.length}`,
        dateOfBirth: teacher.dateOfBirth,
        gender: teacher.gender,
        department: teacher.department,
        designation: teacher.designation,
        subjects: teacher.subjects
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

    // Create Students and Parents
    console.log('👨‍🎓 Creating students and parents...');
    const studentsData = [
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
        role: 'student'
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
        role: 'parent'
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

    console.log(`   ✅ Created 2 timetables for classes`);

    
    console.log('\n✅ Sample data created successfully!\n');
    console.log('=== LOGIN CREDENTIALS ===\n');
    console.log('Admin:');
    console.log('  Email: admin@schoo');
    console.log('  PIN: 1234\n');
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
    console.log('Parents:');
    console.log('  Email: parent.wilson@email.com');
    console.log('  Email: parent.davis@email.com');
    console.log('  Email: parent.murphy@email.com');
    console.log('  Password: parent123');
    console.log('  PIN: 1234y@email.com');
    console.log('  Password: parent123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
};

sampleData();

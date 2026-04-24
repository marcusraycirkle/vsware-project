const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Parent = require('./models/Parent');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Room = require('./models/Room');

dotenv.config();

const houses = ['Bride', 'Ide', 'Tola', 'Seanan', 'Padraig', 'Conaire'];
const yearGroups = [
  { year: 1, name: 'First Year' },
  { year: 2, name: 'Second Year' },
  { year: 3, name: 'Third Year' },
  { year: 4, name: 'TY' },
  { year: 5, name: 'Fifth Year' },
  { year: 6, name: 'Sixth Year' }
];

const seedCompMIS = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for CompMIS seeding');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Parent.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Room.deleteMany({});
    console.log('   ✅ Data cleared');

    // Create Principal/Admin User
    console.log('👤 Creating principal account...');
    const principalUser = new User({
      email: 'principal@shannoncomp.ie',
      password: 'admin2024',
      pin: '1234',
      firstName: 'Principal',
      lastName: 'Administrator',
      role: 'principal',
      phone: '0612345678',
      isActive: true
    });
    await principalUser.save();
    console.log('   ✅ Principal: principal@shannoncomp.ie / PIN: 1234');

    // Create Secretary account for portal flow testing
    console.log('👤 Creating secretary account...');
    const secretaryUser = new User({
      email: 'secretary@shannoncomp.ie',
      password: 'sec24',
      pin: '4321',
      firstName: 'Casey',
      lastName: 'Ashe',
      role: 'secretary',
      phone: '0870001234',
      isActive: true
    });
    await secretaryUser.save();
    console.log('   ✅ Secretary: secretary@shannoncomp.ie / PIN: 4321');

    // Create Subjects
    console.log('📚 Creating subjects...');
    const subjectsData = [
      { name: 'Mathematics', code: 'MATH', department: 'Mathematics' },
      { name: 'English', code: 'ENG', department: 'Languages' },
      { name: 'Irish', code: 'GAE', department: 'Languages' },
      { name: 'Biology', code: 'BIO', department: 'Science' },
      { name: 'Chemistry', code: 'CHEM', department: 'Science' },
      { name: 'Physics', code: 'PHY', department: 'Science' },
      { name: 'History', code: 'HIST', department: 'Humanities' },
      { name: 'Geography', code: 'GEO', department: 'Humanities' },
      { name: 'Business Studies', code: 'BUS', department: 'Business' },
      { name: 'Accounting', code: 'ACC', department: 'Business' },
      { name: 'Computer Science', code: 'CS', department: 'IT' },
      { name: 'Home Economics', code: 'HOME', department: 'Home Economics' },
      { name: 'Art', code: 'ART', department: 'Art' },
      { name: 'Physical Education', code: 'PE', department: 'PE' },
      { name: 'Music', code: 'MUS', department: 'Music' }
    ];

    const subjects = [];
    for (const sub of subjectsData) {
      const subject = new Subject({
        name: sub.name,
        code: sub.code,
        department: sub.department,
        description: `${sub.name} curriculum for St Patrick's Comprehensive School`
      });
      await subject.save();
      subjects.push(subject);
    }
    console.log(`   ✅ Created ${subjects.length} subjects`);

    // Create 57 Rooms with Categories
    console.log('🏫 Creating 57 rooms...');
    const roomsData = [
      // IT Rooms (1-5)
      { roomNumber: 'IT-01', roomName: 'IT Room 1', category: 'IT Rooms', capacity: 30, floor: 1, features: ['Projector', 'Whiteboard'] },
      { roomNumber: 'IT-02', roomName: 'IT Room 2', category: 'IT Rooms', capacity: 30, floor: 1, features: ['Projector', 'Whiteboard'] },
      { roomNumber: 'IT-03', roomName: 'IT Room 3', category: 'IT Rooms', capacity: 28, floor: 2, features: ['Projector', 'Whiteboard'] },
      { roomNumber: 'IT-04', roomName: 'IT Room 4', category: 'IT Rooms', capacity: 28, floor: 2, features: ['Projector', 'Whiteboard'] },
      { roomNumber: 'IT-05', roomName: 'IT Room 5', category: 'IT Rooms', capacity: 25, floor: 2, features: ['Projector', 'Whiteboard'] },
      
      // Science Labs (6-12)
      { roomNumber: 'SCI-01', roomName: 'Science Lab 1', category: 'Science Labs', capacity: 24, floor: 0, features: ['Projector', 'Whiteboard', 'Lab Equipment'] },
      { roomNumber: 'SCI-02', roomName: 'Science Lab 2', category: 'Science Labs', capacity: 24, floor: 0, features: ['Projector', 'Whiteboard', 'Lab Equipment'] },
      { roomNumber: 'SCI-03', roomName: 'Science Lab 3', category: 'Science Labs', capacity: 24, floor: 0, features: ['Projector', 'Whiteboard', 'Lab Equipment'] },
      { roomNumber: 'SCI-04', roomName: 'Biology Lab', category: 'Science Labs', capacity: 26, floor: 1, features: ['Projector', 'Whiteboard', 'Microscopes'] },
      { roomNumber: 'SCI-05', roomName: 'Chemistry Lab', category: 'Science Labs', capacity: 26, floor: 1, features: ['Projector', 'Whiteboard', 'Fume Hoods'] },
      { roomNumber: 'SCI-06', roomName: 'Physics Lab', category: 'Science Labs', capacity: 26, floor: 1, features: ['Projector', 'Whiteboard', 'Physics Equipment'] },
      { roomNumber: 'SCI-07', roomName: 'Science Prep Room', category: 'Science Labs', capacity: 4, floor: 1, features: ['Storage'] },
      
      // Home Ec Rooms (13-16)
      { roomNumber: 'HE-01', roomName: 'Home Ec Room 1', category: 'Home Economics Rooms', capacity: 20, floor: 0, features: ['Projector', 'Whiteboard', 'Cooking Stations'] },
      { roomNumber: 'HE-02', roomName: 'Home Ec Room 2', category: 'Home Economics Rooms', capacity: 20, floor: 0, features: ['Projector', 'Whiteboard', 'Cooking Stations'] },
      { roomNumber: 'HE-03', roomName: 'Textiles Room', category: 'Home Economics Rooms', capacity: 18, floor: 0, features: ['Whiteboard', 'Sewing Machines'] },
      { roomNumber: 'HE-04', roomName: 'Food Studies Room', category: 'Home Economics Rooms', capacity: 16, floor: 0, features: ['Projector', 'Whiteboard', 'Demo Kitchen'] },
      
      // Art Rooms (17-20)
      { roomNumber: 'ART-01', roomName: 'Art Room 1', category: 'Art Rooms', capacity: 24, floor: 3, features: ['Projector', 'Whiteboard', 'Art Supplies'] },
      { roomNumber: 'ART-02', roomName: 'Art Room 2', category: 'Art Rooms', capacity: 24, floor: 3, features: ['Projector', 'Whiteboard', 'Art Supplies'] },
      { roomNumber: 'ART-03', roomName: 'Pottery Studio', category: 'Art Rooms', capacity: 16, floor: 3, features: ['Pottery Wheels', 'Kiln'] },
      { roomNumber: 'ART-04', roomName: 'Design Room', category: 'Art Rooms', capacity: 20, floor: 3, features: ['Projector', 'Whiteboard', 'Design Tools'] },
      
      // Lecture Theatre
      { roomNumber: 'LT-01', roomName: 'Main Lecture Theatre', category: 'Lecture Theatre', capacity: 120, floor: 0, features: ['Projector', 'Sound System', 'Tiered Seating'] },
      
      // General Classrooms (22-57)
      ...Array.from({ length: 36 }, (_, i) => ({
        roomNumber: `GEN-${String(i + 1).padStart(2, '0')}`,
        roomName: `Classroom ${i + 1}`,
        category: 'General Classrooms',
        capacity: 30,
        floor: i < 12 ? 0 : i < 24 ? 1 : i < 36 ? 2 : 3,
        features: ['Projector', 'Whiteboard']
      }))
    ];

    const rooms = [];
    for (const roomData of roomsData) {
      const room = new Room(roomData);
      await room.save();
      rooms.push(room);
    }
    console.log(`   ✅ Created ${rooms.length} rooms`);

    // Create Cory Kilmartin (Specific Teacher)
    console.log('👨‍🏫 Creating Cory Kilmartin...');
    const coryUser = new User({
      email: '24corykilmartin@shannoncomp.ie',
      password: '4096',
      pin: '4096',
      firstName: 'Cory',
      lastName: 'Kilmartin',
      role: 'teacher',
      phone: '0852604745',
      dateOfBirth: new Date('2000-01-15'),
      gender: 'Male',
      isActive: true
    });
    await coryUser.save();

    const coryTeacher = new Teacher({
      user: coryUser._id,
      teacherId: 'TCH-2024-001',
      employeeId: 'EMP-2024-001',
      dateOfBirth: new Date('2000-01-15'),
      gender: 'Male',
      joiningDate: new Date('2024-09-01'),
      subjects: [subjects[10]._id, subjects[0]._id], // Computer Science, Math
      department: 'IT',
      designation: 'Teacher',
      parkingSpot: '14',
      permissionLevel: 'Admin',
      qualification: {
        degree: 'BSc Computer Science',
        university: 'University of Limerick',
        year: 2023,
        specialization: 'Software Engineering'
      },
      emergencyContact: {
        name: 'Parent',
        relationship: 'Parent',
        phone: '0852604745'
      },
      status: 'Active'
    });
    await coryTeacher.save();
    console.log(`   ✅ Cory Kilmartin: 24corykilmartin@shannoncomp.ie / Password: 4096 / Parking: 14`);

    // Create Zuzanna Frankowska (Specific Teacher)
    console.log('👩‍🏫 Creating Zuzanna Frankowska...');
    const zuzannaUser = new User({
      email: '24zuzannafrankowska@shannoncomp.ie',
      password: 'zuzanna2024',
      pin: '3454',
      firstName: 'Zuzanna',
      lastName: 'Frankowska',
      role: 'teacher',
      phone: '0873453454',
      dateOfBirth: new Date('2001-03-20'),
      gender: 'Female',
      isActive: true
    });
    await zuzannaUser.save();

    const zuzannaTeacher = new Teacher({
      user: zuzannaUser._id,
      teacherId: 'TCH-2024-002',
      employeeId: 'EMP-2024-002',
      dateOfBirth: new Date('2001-03-20'),
      gender: 'Female',
      joiningDate: new Date('2024-09-01'),
      subjects: [subjects[1]._id, subjects[2]._id], // English, Irish
      department: 'Languages',
      designation: 'Teacher',
      parkingSpot: '7',
      permissionLevel: 'Editor',
      qualification: {
        degree: 'BA English & Irish',
        university: 'University College Dublin',
        year: 2022,
        specialization: 'Language Education'
      },
      emergencyContact: {
        name: 'Parent',
        relationship: 'Parent',
        phone: '0873453454'
      },
      status: 'Active'
    });
    await zuzannaTeacher.save();
    console.log(`   ✅ Zuzanna Frankowska: 24zuzannafrankowska@shannoncomp.ie / PIN: 3454 / Parking: 7`);

    // Create additional teachers
    console.log('👨‍🏫 Creating additional teachers...');
    const teachersData = [
      { firstName: 'Sean', lastName: 'Murphy', email: 'sean.murphy@shannoncomp.ie', pin: '5678', dob: new Date('1985-05-12'), gender: 'Male', department: 'Science', designation: 'Teacher', permission: 'General', subjects: [subjects[3]._id] },
      { firstName: 'Mary', lastName: 'OConnor', email: 'mary.oconnor@shannoncomp.ie', pin: '8901', dob: new Date('1980-08-22'), gender: 'Female', department: 'Mathematics', designation: 'Head of Department', permission: 'General', subjects: [subjects[0]._id] },
      { firstName: 'Patrick', lastName: 'Ryan', email: 'patrick.ryan@shannoncomp.ie', pin: '2345', dob: new Date('1978-03-15'), gender: 'Male', department: 'Humanities', designation: 'Teacher', permission: 'Editor', subjects: [subjects[6]._id] },
      { firstName: 'Aoife', lastName: 'Walsh', email: 'aoife.walsh@shannoncomp.ie', pin: '6789', dob: new Date('1990-11-05'), gender: 'Female', department: 'Business', designation: 'Teacher', permission: 'General', subjects: [subjects[8]._id] },
      { firstName: 'Michael', lastName: 'Brennan', email: 'michael.brennan@shannoncomp.ie', pin: '9012', dob: new Date('1982-07-30'), gender: 'Male', department: 'PE', designation: 'Teacher', permission: 'General', subjects: [subjects[13]._id] }
    ];

    const teachers = [coryTeacher, zuzannaTeacher];
    for (const t of teachersData) {
      const user = new User({
        email: t.email,
        password: t.firstName.toLowerCase() + '2024',
        pin: t.pin,
        firstName: t.firstName,
        lastName: t.lastName,
        role: 'teacher',
        phone: '086' + Math.floor(Math.random() * 10000000),
        dateOfBirth: t.dob,
        gender: t.gender,
        isActive: true
      });
      await user.save();

      const teacher = new Teacher({
        user: user._id,
        teacherId: `TCH-2024-${String(teachers.length + 1).padStart(3, '0')}`,
        employeeId: `EMP-2024-${String(teachers.length + 1).padStart(3, '0')}`,
        dateOfBirth: t.dob,
        gender: t.gender,
        joiningDate: new Date('2024-09-01'),
        subjects: t.subjects,
        department: t.department,
        designation: t.designation,
        parkingSpot: String(teachers.length + 1),
        permissionLevel: t.permission,
        status: 'Active'
      });
      await teacher.save();
      teachers.push(teacher);
    }
    console.log(`   ✅ Created ${teachers.length} total teachers`);

    // Create Classes for all year groups
    console.log('🎓 Creating classes for all year groups...');
    const classes = [];
    for (const yg of yearGroups) {
      const cls = new Class({
        name: `${yg.name} - Main`,
        year: yg.year,
        yearGroup: yg.name,
        section: 'A',
        academicYear: '2024-2025',
        teacher: teachers[Math.floor(Math.random() * teachers.length)]._id,
        subjects: subjects.slice(0, 8).map(s => s._id),
        room: rooms[21 + yg.year]._id, // Assign general classrooms
        capacity: 30
      });
      await cls.save();
      classes.push(cls);
    }
    console.log(`   ✅ Created ${classes.length} classes`);

    // Create Students (5 per house per year = 180 students)
    console.log('👨‍🎓 Creating students across all houses and years...');
    const firstNames = ['Liam', 'Emma', 'Noah', 'Olivia', 'Jack', 'Sophie', 'James', 'Aoife', 'Conor', 'Saoirse', 'Sean', 'Ciara', 'Daniel', 'Niamh', 'Ryan'];
    const lastNames = ['Murphy', 'Kelly', 'OSullivan', 'Walsh', 'Smith', 'OBrien', 'Byrne', 'Ryan', 'Connor', 'ONeill', 'Reilly', 'Doyle', 'McCarthy', 'Gallagher', 'Doherty'];

    const students = [];
    const parents = [];
    let studentCount = 0;

    for (const yg of yearGroups) {
      const classForYear = classes.find(c => c.year === yg.year);
      
      for (const house of houses) {
        for (let i = 0; i < 5; i++) {
          studentCount++;
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const birthYear = 2010 - yg.year + 1;
          const dob = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
          const gender = Math.random() > 0.5 ? 'Male' : 'Female';
          
          // Create parent
          const parentUser = new User({
            email: `parent${studentCount}@shannoncomp.ie`,
            password: 'parent123',
            pin: String(1000 + studentCount).slice(-4),
            firstName: `Parent of`,
            lastName: `${firstName} ${lastName}`,
            role: 'parent',
            phone: '087' + Math.floor(Math.random() * 10000000),
            isActive: true
          });
          await parentUser.save();

          const parent = new Parent({
            user: parentUser._id,
            parentId: `PAR-${String(studentCount).padStart(4, '0')}`,
            relationship: Math.random() > 0.5 ? 'Father' : 'Mother',
            occupation: 'Parent',
            children: [] // Will update after creating student
          });
          await parent.save();
          parents.push(parent);

          // Create student
          const studentUser = new User({
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentCount}@student.shannoncomp.ie`,
            password: 'student123',
            pin: String(2000 + studentCount).slice(-4),
            firstName: firstName,
            lastName: lastName,
            role: 'student',
            dateOfBirth: dob,
            gender: gender,
            isActive: true
          });
          await studentUser.save();

          const student = new Student({
            user: studentUser._id,
            studentId: `STU-${String(studentCount).padStart(4, '0')}`,
            admissionNumber: `ADM-2024-${String(studentCount).padStart(4, '0')}`,
            vswareId: `VS-${String(studentCount).padStart(6, '0')}`,
            dateOfBirth: dob,
            gender: gender,
            currentYear: yg.year,
            yearName: yg.name,
            yearGroup: yg.name,
            house: house,
            admissionDate: new Date('2024-09-01'),
            parents: [parent._id],
            classes: [classForYear._id],
            status: 'Active'
          });
          await student.save();
          students.push(student);

          // Update parent with child reference
          parent.children.push(student._id);
          await parent.save();
        }
      }
    }
    console.log(`   ✅ Created ${students.length} students across ${houses.length} houses and ${yearGroups.length} years`);

    // Create deterministic test parent + student accounts for flow testing
    console.log('🧪 Creating fixed test parent/student accounts...');
    const testParentUser = new User({
      email: 'parent.test@shannoncomp.ie',
      password: 'parent123',
      pin: '1234',
      firstName: 'Pat',
      lastName: 'TestParent',
      role: 'parent',
      phone: '0871000001',
      isActive: true
    });
    await testParentUser.save();

    const testParent = new Parent({
      user: testParentUser._id,
      parentId: 'PAR-TEST-0001',
      relationship: 'Mother',
      occupation: 'Parent',
      children: []
    });
    await testParent.save();
    parents.push(testParent);

    const firstYearClass = classes.find(c => c.year === 1) || classes[0];
    const testStudentUser = new User({
      email: 'student.test@shannoncomp.ie',
      password: 'student123',
      pin: '1234',
      firstName: 'Sam',
      lastName: 'TestStudent',
      role: 'student',
      dateOfBirth: new Date('2010-01-15'),
      gender: 'Male',
      isActive: true
    });
    await testStudentUser.save();

    const testStudent = new Student({
      user: testStudentUser._id,
      studentId: 'STU-TEST-0001',
      admissionNumber: 'ADM-TEST-0001',
      vswareId: 'VS-TEST-0001',
      dateOfBirth: new Date('2010-01-15'),
      gender: 'Male',
      currentYear: 1,
      yearName: 'First Year',
      yearGroup: 'First Year',
      house: 'Bride',
      admissionDate: new Date('2024-09-01'),
      parents: [testParent._id],
      classes: [firstYearClass._id],
      status: 'Active'
    });
    await testStudent.save();
    students.push(testStudent);

    testParent.children.push(testStudent._id);
    await testParent.save();
    console.log('   ✅ student.test@shannoncomp.ie / student123 and parent.test@shannoncomp.ie / parent123');

    // Summary
    console.log('\n🎉 CompMIS Database Seeded Successfully!\n');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log('Principal: principal@shannoncomp.ie / PIN: 1234');
    console.log('Secretary: secretary@shannoncomp.ie / PIN: 4321');
    console.log('Cory Kilmartin: 24corykilmartin@shannoncomp.ie / Password: 4096 / Parking: 14');
    console.log('Zuzanna Frankowska: 24zuzannafrankowska@shannoncomp.ie / PIN: 3454 / Parking: 7');
    console.log('Sample Student: student.test@shannoncomp.ie / student123');
    console.log('Sample Parent: parent.test@shannoncomp.ie / parent123');
    console.log('\n=== STATISTICS ===');
    console.log(`Teachers: ${teachers.length}`);
    console.log(`Students: ${students.length}`);
    console.log(`Parents: ${parents.length}`);
    console.log(`Classes: ${classes.length}`);
    console.log(`Subjects: ${subjects.length}`);
    console.log(`Rooms: ${rooms.length}`);
    console.log(`Houses: ${houses.join(', ')}`);
    console.log(`\nStudents per house: ${students.length / houses.length}`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedCompMIS();

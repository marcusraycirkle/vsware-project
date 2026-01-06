const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Attendance = require('./models/Attendance');
const Student = require('./models/Student');
const Class = require('./models/Class');
const Teacher = require('./models/Teacher');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
const Subject = require('./models/Subject');

dotenv.config();

const testAttendance = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch data
    const classes = await Class.find().populate('students');
    const teachers = await Teacher.find().populate('user');
    const timetables = await Timetable.find().populate('class teacher');

    console.log('📊 Current Data Summary:');
    console.log(`   Classes: ${classes.length}`);
    console.log(`   Teachers: ${teachers.length}`);
    console.log(`   Timetables: ${timetables.length}\n`);

    // Display timetables
    console.log('📅 Timetables:');
    for (const timetable of timetables) {
      console.log(`\n   Class: ${timetable.class.name} (${timetable.class.year})`);
      console.log(`   Academic Year: ${timetable.academicYear} - ${timetable.term}`);
      console.log(`   Status: ${timetable.status}\n`);
      
      for (const day of timetable.schedule) {
        console.log(`   ${day.day}:`);
        for (const period of day.periods) {
          const subject = await Subject.findById(period.subject);
          const teacher = await Teacher.findById(period.teacher).populate('user');
          console.log(`      Period ${period.periodNumber} (${period.startTime}-${period.endTime}): ${subject?.name || 'N/A'} - ${teacher?.user.firstName} ${teacher?.user.lastName} - ${period.room}`);
        }
      }
    }

    // Test marking attendance
    console.log('\n\n📝 Testing Attendance Marking:\n');
    
    const firstClass = classes[0];
    const firstStudent = await Student.findById(firstClass.students[0]);
    const firstTeacher = teachers[0];

    // Get today's date
    const today = new Date();
    
    // Check first period of today's schedule
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
    const timetable = timetables.find(t => t.class._id.toString() === firstClass._id.toString());
    const todaySchedule = timetable.schedule.find(s => s.day === dayName);
    
    if (todaySchedule && todaySchedule.periods.length > 0) {
      const firstPeriod = todaySchedule.periods[0];
      
      console.log(`   Marking attendance for:`);
      console.log(`   Student: ${firstStudent.studentId}`);
      console.log(`   Class: ${firstClass.name}`);
      console.log(`   Day: ${dayName}`);
      console.log(`   Period: ${firstPeriod.periodNumber}`);
      console.log(`   Time: ${firstPeriod.startTime}-${firstPeriod.endTime}\n`);

      // Mark attendance as Present
      const attendance = new Attendance({
        student: firstStudent._id,
        class: firstClass._id,
        date: today,
        status: 'Present',
        period: firstPeriod.periodNumber,
        subject: firstPeriod.subject,
        markedBy: firstTeacher._id,
        arrivalTime: firstPeriod.startTime
      });
      
      await attendance.save();
      console.log('   ✅ Attendance marked as Present');

      // Add another attendance record for a different student
      if (firstClass.students.length > 1) {
        const secondStudent = await Student.findById(firstClass.students[1]);
        const attendance2 = new Attendance({
          student: secondStudent._id,
          class: firstClass._id,
          date: today,
          status: 'Late',
          period: firstPeriod.periodNumber,
          subject: firstPeriod.subject,
          markedBy: firstTeacher._id,
          arrivalTime: '09:15',
          reason: 'Traffic delay'
        });
        await attendance2.save();
        console.log(`   ✅ Attendance marked as Late for second student`);
      }

      // Query attendance records
      console.log('\n📋 Attendance Records for Today:\n');
      const attendanceRecords = await Attendance.find({
        class: firstClass._id,
        date: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      })
        .populate('student', 'studentId user')
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'firstName lastName' }
        })
        .populate('subject', 'name')
        .populate({
          path: 'markedBy',
          populate: { path: 'user', select: 'firstName lastName' }
        });

      for (const record of attendanceRecords) {
        console.log(`   Student: ${record.student.user.firstName} ${record.student.user.lastName} (${record.student.studentId})`);
        console.log(`   Status: ${record.status}`);
        console.log(`   Period: ${record.period}`);
        console.log(`   Subject: ${record.subject?.name || 'N/A'}`);
        console.log(`   Marked By: ${record.markedBy.user.firstName} ${record.markedBy.user.lastName}`);
        if (record.reason) console.log(`   Reason: ${record.reason}`);
        console.log('');
      }

    } else {
      console.log(`   ⚠️  No schedule found for ${dayName}. Using Monday's schedule for testing...\n`);
      
      const mondaySchedule = timetable.schedule.find(s => s.day === 'Monday');
      const firstPeriod = mondaySchedule.periods[0];
      
      console.log(`   Marking attendance for:`);
      console.log(`   Student: ${firstStudent.studentId}`);
      console.log(`   Class: ${firstClass.name}`);
      console.log(`   Period: ${firstPeriod.periodNumber}`);
      console.log(`   Time: ${firstPeriod.startTime}-${firstPeriod.endTime}\n`);

      const attendance = new Attendance({
        student: firstStudent._id,
        class: firstClass._id,
        date: today,
        status: 'Present',
        period: firstPeriod.periodNumber,
        subject: firstPeriod.subject,
        markedBy: firstTeacher._id,
        arrivalTime: firstPeriod.startTime
      });
      
      await attendance.save();
      console.log('   ✅ Attendance marked successfully');
    }

    console.log('\n✅ Attendance testing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAttendance();

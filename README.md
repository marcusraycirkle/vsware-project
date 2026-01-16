# MISpal SchoolWare - Comprehensive School Management System

A full-featured school management and student information system inspired by VSware.ie, built with Node.js, Express, MongoDB, and React.

## Features

### For All Users
- **Authentication & Authorization** - Role-based access control (Admin, Principal, Teacher, Parent, Student)
- **Dashboard** - Personalized dashboards for each user role
- **Internal Messaging (VS-Mail)** - Secure communication system within the school
- **Notifications** - Real-time updates and alerts

### For Administrators & Principals
- **User Management** - Create and manage users (students, teachers, parents, staff)
- **Class Management** - Organize classes, assign teachers and students
- **Subject Management** - Define subjects and curricula
- **Timetable Management** - Create and publish timetables
- **Reports & Analytics** - Comprehensive reporting on all aspects of school operations
- **Financial Management** - Track payments, fees, and generate invoices

### For Teachers
- **Attendance Tracking** - Mark and manage student attendance
- **Behavior Logs** - Record positive and negative behavior incidents
- **Assessment Management** - Create exams, record grades, publish results
- **Class Communication** - Send messages to students and parents
- **Timetable Access** - View personal teaching schedule
- **Student Records** - Access student information and performance data

### For Parents
- **Child Monitoring** - View all children's academic progress
- **Attendance Reports** - Track child's attendance records
- **Behavior Notifications** - Receive alerts about behavior incidents
- **Assessment Results** - View published exam results and grades
- **Fee Management** - View and pay school fees online
- **Messaging** - Communicate with teachers and school administration

### For Students
- **Personal Dashboard** - View academic performance and schedules
- **Timetable** - Access class schedule
- **Results** - View published assessment results
- **Attendance Record** - Monitor personal attendance
- **Behavior Log** - View behavior records and points
- **Messaging** - Communicate with teachers

## Technology Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT
- **Frontend:** React (to be implemented)

## Installation & Setup

1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env` and update values
3. Start MongoDB
4. Run server: `npm run dev` (development) or `npm start` (production)

## API Endpoints

See full API documentation in the README sections above for all available endpoints covering:
- Authentication, Users, Students, Teachers, Classes
- Timetables, Attendance, Behavior, Assessments
- Messages, Payments, Reports & Analytics

## License

MIT
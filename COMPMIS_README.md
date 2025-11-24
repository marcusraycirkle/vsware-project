# 🎓 CompMIS - St Patrick's Comprehensive School Management System

**CompMIS** (Comprehensive Management Information System) is a complete school management and student information system built for St Patrick's Comprehensive School, Shannon.

> Based on VSware.ie functionality with custom features for Shannon Comp

---

## 🌟 System Overview

CompMIS provides a complete digital infrastructure for managing all aspects of school administration, including:

- **Student Information Management** - Complete student profiles with house assignments
- **Teacher Management** - Staff profiles with permission levels and parking assignments
- **Attendance Tracking** - Real-time attendance monitoring with parent notifications
- **Timetabling** - Comprehensive schedule management for 57 rooms
- **Behavior Logging** - Positive and negative behavior tracking with points system
- **Assessment & Grading** - Exam management and result publishing
- **Internal Messaging (VS-Mail)** - Communication between staff, parents, and students
- **Fee Management** - Invoice generation and payment tracking
- **Room Booking System** - Manage 57 rooms across 5 categories
- **House System** - 6 houses (Bride, Ide, Tola, Seanan, Padraig, Conaire)

---

## 🏫 School Structure

### Houses (Teaghlachs)
- **Bride**
- **Ide**
- **Tola**
- **Seanan**
- **Padraig**
- **Conaire**

### Year Groups
1. **First Year** (Year 1)
2. **Second Year** (Year 2)
3. **Third Year** (Year 3)
4. **TY** (Transition Year - Year 4)
5. **Fifth Year** (Year 5)
6. **Sixth Year** (Year 6)

### Current Statistics
- 👨‍🏫 **7 Teachers**
- 👨‍🎓 **180 Students** (30 per house, 5 per house per year)
- 👨‍👩‍👧 **180 Parents**
- 🎓 **6 Classes** (one per year group)
- 📚 **15 Subjects**
- 🏫 **57 Rooms** across 5 categories

---

## 🔐 Login Credentials

### Principal Account
- **Email:** principal@shannoncomp.ie
- **PIN:** 1234
- **Access:** Full system administration

### Teachers

#### Cory Kilmartin (Admin)
- **Email:** 24corykilmartin@shannoncomp.ie
- **Phone:** 0852604745
- **PIN:** 1470
- **Parking Spot:** 14
- **Permission Level:** Admin (Full Access)
- **Department:** IT
- **Subjects:** Computer Science, Mathematics

#### Zuzanna Frankowska (Editor)
- **Email:** 24zuzannafrankowska@shannoncomp.ie
- **Phone:** 0873453454
- **PIN:** 3454
- **Parking Spot:** 7
- **Permission Level:** Editor (Can edit timetables and student info)
- **Department:** Languages
- **Subjects:** English, Irish

#### Additional Staff (General Permission Level)
- **Sean Murphy** - Science (PIN: 5678, Parking: 3)
- **Mary O'Connor** - Mathematics (PIN: 8901, Parking: 4)
- **Patrick Ryan** - Humanities (PIN: 2345, Parking: 5)
- **Aoife Walsh** - Business (PIN: 6789, Parking: 6)
- **Michael Brennan** - PE (PIN: 9012, Parking: 7)

### Students & Parents
- **Student Format:** `[firstname].[lastname][number]@student.shannoncomp.ie`
- **Parent Format:** `parent[number]@shannoncomp.ie`
- **Student PINs:** 2000+ (4 digits)
- **Parent PINs:** 1000+ (4 digits)
- **Default Password:** student123 / parent123

---

## 🏢 Room Categories & Facilities

### IT Rooms (5 rooms)
- IT-01, IT-02, IT-03, IT-04, IT-05
- Capacity: 25-30 students
- Features: Projector, Whiteboard, Computers

### Science Labs (7 rooms)
- SCI-01, SCI-02, SCI-03 (General Labs)
- SCI-04 (Biology Lab)
- SCI-05 (Chemistry Lab)
- SCI-06 (Physics Lab)
- SCI-07 (Prep Room)
- Capacity: 4-26 students
- Features: Lab Equipment, Microscopes, Fume Hoods

### Home Economics Rooms (4 rooms)
- HE-01, HE-02 (Home Ec Rooms)
- HE-03 (Textiles Room)
- HE-04 (Food Studies Room)
- Capacity: 16-20 students
- Features: Cooking Stations, Sewing Machines

### Art Rooms (4 rooms)
- ART-01, ART-02 (General Art Rooms)
- ART-03 (Pottery Studio)
- ART-04 (Design Room)
- Capacity: 16-24 students
- Features: Art Supplies, Pottery Wheels, Kiln

### Lecture Theatre (1 room)
- LT-01 (Main Lecture Theatre)
- Capacity: 120 students
- Features: Projector, Sound System, Tiered Seating

### General Classrooms (36 rooms)
- GEN-01 to GEN-36
- Capacity: 30 students per room
- Features: Projector, Whiteboard
- Distribution: Ground Floor (12), 1st Floor (12), 2nd Floor (12), 3rd Floor (0)

---

## 👥 Teacher Permission Levels

### Admin Level
- **Full system access**
- Create/edit/delete any record
- Manage teachers and create accounts
- Access all reports and analytics
- Configure system settings
- Assign parking spots
- **Example:** Cory Kilmartin

### Editor Level
- **Edit timetables and schedules**
- Modify student information
- Update room bookings
- Edit assessments and grades
- Cannot create teacher accounts
- **Example:** Zuzanna Frankowska

### General Level
- **Standard teacher access**
- Mark attendance
- Log behavior incidents
- Enter grades
- Send internal messages (VS-Mail)
- View assigned classes
- Cannot edit timetables

---

## 🔑 Authentication System

CompMIS uses **PIN-based authentication** instead of traditional passwords:

- **PIN Length:** 4-6 digits
- **Unique to each user**
- **Assigned at account creation**
- **Easier to remember than passwords**
- **Suitable for school environment**

### Login Process
1. Enter email address
2. Enter PIN (4-6 digits)
3. System authenticates and routes to appropriate dashboard

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (via Docker or local installation)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd /workspaces/vsware-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start MongoDB**
   ```bash
   docker-compose up -d mongodb
   ```

5. **Seed the database** (already done)
   ```bash
   node seed-compmis.js
   ```

6. **Start the server**
   ```bash
   npm start
   ```

Server runs on http://localhost:5000

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/PIN
- `GET /api/auth/me` - Get current user profile

### Students
- `GET /api/students` - List all students (with filters)
- `GET /api/students?house=Bride` - Filter by house
- `GET /api/students?year=1` - Filter by year
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers?permissionLevel=Admin` - Filter by permission
- `POST /api/teachers` - Create new teacher (Admin only)
- `GET /api/teachers/:id` - Get teacher details
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Remove teacher

### Classes
- `GET /api/classes` - List all classes
- `GET /api/classes?year=3` - Filter by year
- `POST /api/classes` - Create new class
- `POST /api/classes/:id/students` - Enroll student
- `GET /api/classes/:id/report` - Class performance report

### Attendance
- `POST /api/attendance` - Mark single attendance
- `POST /api/attendance/bulk` - Mark class attendance
- `GET /api/attendance/reports` - Attendance reports
- `GET /api/attendance/student/:studentId` - Student attendance history

### Behavior
- `POST /api/behavior` - Log behavior incident
- `PUT /api/behavior/:id` - Update incident
- `GET /api/behavior/student/:studentId` - Student behavior history
- `GET /api/behavior/reports` - Behavior analytics

### Timetable
- `POST /api/timetable` - Create timetable
- `PUT /api/timetable/:id` - Edit timetable
- `POST /api/timetable/:id/publish` - Publish schedule
- `GET /api/timetable/class/:classId` - Get class schedule
- `GET /api/timetable/teacher/:teacherId` - Get teacher schedule

### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/rooms?category=Science Labs` - Filter by category
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details

### Room Bookings
- `GET /api/room-bookings` - List bookings
- `POST /api/room-bookings` - Create booking
- `PUT /api/room-bookings/:id` - Update booking
- `DELETE /api/room-bookings/:id` - Cancel booking

### Messages (VS-Mail)
- `POST /api/messages` - Send message
- `POST /api/messages/broadcast` - Send broadcast message
- `GET /api/messages/inbox` - Get inbox
- `PUT /api/messages/:id/read` - Mark as read

### Assessments
- `POST /api/assessments` - Create assessment
- `POST /api/assessments/:id/results` - Enter grades
- `POST /api/assessments/:id/publish` - Publish results
- `GET /api/assessments/class/:classId/analytics` - Analytics

### Reports
- `GET /api/reports/dashboard` - Dashboard metrics
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/academic` - Academic performance
- `GET /api/reports/behavior` - Behavior statistics
- `GET /api/reports/financial` - Financial reports

---

## 🛠️ Technology Stack

### Backend
- **Node.js v18** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password/PIN hashing
- **express-validator** - Input validation

### Security
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - DDoS protection
- **JWT** - Secure token-based auth

### DevOps
- **Docker** - Containerization
- **docker-compose** - Multi-container orchestration
- **nodemon** - Development auto-reload

---

## 📋 Database Models

### Core Models
1. **User** - Authentication and base user info
2. **Student** - Student profiles with house assignments
3. **Teacher** - Staff profiles with permissions
4. **Parent** - Parent/guardian information
5. **Class** - Class groups and form rooms
6. **Subject** - Subject definitions

### Academic Models
7. **Timetable** - Schedule management
8. **Attendance** - Daily attendance tracking
9. **Behavior** - Incident logging
10. **Assessment** - Exams and grading
11. **Message** - Internal messaging
12. **Payment** - Fee management

### Facility Models
13. **Room** - Room definitions
14. **RoomBooking** - Room reservations

---

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/compmis
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRE=30d
```

### MongoDB Docker Setup
```yaml
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
```

---

## 📱 Real-time Features

CompMIS uses Socket.IO for real-time updates:

- **Live Attendance Updates** - Instant notification when attendance is marked
- **Message Notifications** - Real-time message delivery
- **Behavior Alerts** - Immediate parent notification for incidents
- **System Announcements** - Broadcast messages to all users

### Socket Events
- `connection` - Client connects
- `attendance:marked` - Attendance updated
- `message:received` - New message
- `behavior:logged` - New incident
- `announcement` - System-wide message

---

## 🎯 Roadmap / Next Steps

### Phase 1: Current (Completed ✅)
- ✅ Complete backend API with 100+ endpoints
- ✅ Database seeding with Shannon Comp data
- ✅ Authentication system with PIN support
- ✅ House system integration
- ✅ Permission levels for teachers
- ✅ 57 rooms with categorization
- ✅ Real-time Socket.IO integration

### Phase 2: Frontend Development
- [ ] React application setup
- [ ] Login page with PIN input
- [ ] Dashboard for each role (Admin, Teacher, Student, Parent)
- [ ] Student management interface
- [ ] Timetable viewer and editor
- [ ] Attendance marking interface
- [ ] Behavior logging form
- [ ] Room booking calendar view
- [ ] Internal messaging (VS-Mail) interface
- [ ] Reports and analytics dashboard

### Phase 3: Advanced Features
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Document generation (PDFs)
- [ ] School website integration
- [ ] Parent portal
- [ ] Student portal
- [ ] SMS notifications
- [ ] Email integration
- [ ] Biometric attendance (optional)

### Phase 4: Deployment
- [ ] MongoDB Atlas setup (free tier)
- [ ] Cloud hosting (Render/Railway/Heroku)
- [ ] Domain setup (shannoncomp.ie subdomain)
- [ ] SSL certificate
- [ ] Backup strategy
- [ ] Monitoring and logging

---

## 🔗 Reference Sites

CompMIS is inspired by and designed to match:
- **St Patrick's Comprehensive School:** https://www.stpatrickscomprehensive.ie/
- **VSware Portal:** https://stpatrickscomprehensive.app.vsware.ie/

---

## 📝 API Testing

Use the provided test script:
```bash
chmod +x test-api.sh
./test-api.sh
```

Or test manually with curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"24corykilmartin@shannoncomp.ie","pin":"1470"}'

# Get students
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🤝 Support & Contact

For issues, questions, or feature requests related to CompMIS:

- **School:** St Patrick's Comprehensive School, Shannon
- **System:** CompMIS (Comprehensive Management Information System)
- **Based on:** VSware.ie functionality

---

## 📄 License

This project is built for St Patrick's Comprehensive School.

---

## 🎓 Credits

**CompMIS** - Built for St Patrick's Comprehensive School, Shannon
**Inspired by:** VSware.ie School Management System

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Backend Complete ✅ | Frontend In Development 🚧

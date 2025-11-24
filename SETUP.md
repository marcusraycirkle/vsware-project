# SchoolWare Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Or run directly
mongod
```

### 3. Configure Environment
The `.env` file is already created with default values. For production, update:
- `JWT_SECRET` - Change to a secure random string
- `MONGODB_URI` - Update if using a different MongoDB connection
- `EMAIL_*` - Configure for email notifications

### 4. Create Sample Data (Optional)
Populate the database with sample users, classes, students, etc.:
```bash
node seed.js
```

This creates:
- 1 Admin user
- 3 Teachers
- 3 Students
- 3 Parents
- 2 Classes
- 6 Subjects

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Or use the startup script
./start.sh
```

The server will start on http://localhost:5000

### 6. Test the API
```bash
./test-api.sh
```

Or manually test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

## Sample Login Credentials

After running `node seed.js`, you can use these credentials:

### Administrator
- **Email:** admin@schoolware.com
- **Password:** admin123

### Teachers
- john.smith@schoolware.com / teacher123
- mary.jones@schoolware.com / teacher123
- david.brown@schoolware.com / teacher123

### Students
- james.wilson@student.schoolware.com / student123
- emma.davis@student.schoolware.com / student123
- michael.murphy@student.schoolware.com / student123

### Parents
- parent.wilson@email.com / parent123
- parent.davis@email.com / parent123
- parent.murphy@email.com / parent123

## API Testing with Postman/Insomnia

### 1. Register/Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@schoolware.com",
  "password": "admin123"
}
```

Save the `token` from the response.

### 2. Use the Token
Add to request headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Example API Calls

**Get all students:**
```http
GET http://localhost:5000/api/students
Authorization: Bearer YOUR_TOKEN
```

**Create a new class:**
```http
POST http://localhost:5000/api/classes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "3rd Year A",
  "year": 3,
  "section": "A",
  "academicYear": "2024-2025",
  "capacity": 30,
  "room": "Room 301"
}
```

**Mark attendance:**
```http
POST http://localhost:5000/api/attendance
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "student": "STUDENT_ID",
  "class": "CLASS_ID",
  "date": "2024-11-24",
  "status": "Present"
}
```

**Send a message:**
```http
POST http://localhost:5000/api/messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "recipients": ["USER_ID"],
  "subject": "Welcome to SchoolWare",
  "body": "This is a test message.",
  "type": "Individual",
  "category": "General"
}
```

## Project Structure

```
vsware-project/
├── models/              # Database models
│   ├── User.js         # User accounts
│   ├── Student.js      # Student profiles
│   ├── Teacher.js      # Teacher profiles
│   ├── Parent.js       # Parent profiles
│   ├── Class.js        # Class management
│   ├── Subject.js      # Subject definitions
│   ├── Timetable.js    # Schedule management
│   ├── Attendance.js   # Attendance tracking
│   ├── Behavior.js     # Behavior logs
│   ├── Assessment.js   # Exams and results
│   ├── Message.js      # Internal messaging
│   └── Payment.js      # Fee management
│
├── routes/              # API endpoints
│   ├── auth.js         # Authentication
│   ├── users.js        # User management
│   ├── students.js     # Student operations
│   ├── teachers.js     # Teacher operations
│   ├── classes.js      # Class management
│   ├── timetable.js    # Timetable operations
│   ├── attendance.js   # Attendance management
│   ├── behavior.js     # Behavior tracking
│   ├── assessments.js  # Assessment management
│   ├── messages.js     # Messaging system
│   ├── payments.js     # Payment management
│   └── reports.js      # Reports and analytics
│
├── middleware/          # Custom middleware
│   └── auth.js         # Authentication middleware
│
├── server.js           # Express app entry point
├── seed.js             # Sample data generator
├── start.sh            # Startup script
├── test-api.sh         # API testing script
├── package.json        # Dependencies
├── .env                # Environment variables
└── README.md           # Documentation
```

## Key Features Implemented

### ✅ User Management
- Role-based authentication (Admin, Principal, Teacher, Parent, Student)
- User profiles with detailed information
- Password hashing and JWT tokens

### ✅ Student Management
- Complete student profiles
- Medical information
- Parent associations
- Class enrollment
- Academic records

### ✅ Teacher Management
- Teacher profiles
- Subject assignments
- Class assignments
- Permissions management

### ✅ Class Management
- Class creation and organization
- Student enrollment
- Teacher assignments
- Subject allocation

### ✅ Timetable Management
- Weekly schedules
- Period-by-period breakdown
- Teacher and class timetables
- Live editing after publication

### ✅ Attendance Tracking
- Daily attendance marking
- Bulk attendance for classes
- Period-wise attendance
- Attendance reports and analytics
- Parent notifications

### ✅ Behavior Management
- Positive and negative behavior logs
- Severity levels
- Category classification
- Action tracking
- Parent notifications and acknowledgment

### ✅ Assessment System
- Multiple assessment types (Exams, Tests, Quizzes, etc.)
- Marks recording
- Automatic grade calculation
- Result publishing
- Student and class analytics

### ✅ Internal Messaging (VS-Mail)
- Individual messages
- Broadcast messages
- Read/unread tracking
- Star and archive
- Reply functionality

### ✅ Payment Management
- Fee invoicing
- Online payment processing
- Payment tracking
- Overdue reports
- Payment reminders

### ✅ Reports & Analytics
- Dashboard overview
- Attendance reports
- Academic performance
- Behavior analysis
- Financial reports
- Class-wise reports

### ✅ Real-time Features
- Socket.IO integration
- Live notifications
- Real-time updates

## Next Steps

### Frontend Development
To complete the system, you'll need to build the React frontend:

1. **Authentication Pages**
   - Login/Registration
   - Password reset

2. **Dashboards**
   - Admin/Principal dashboard
   - Teacher dashboard
   - Parent dashboard
   - Student dashboard

3. **Management Pages**
   - Student management
   - Teacher management
   - Class management
   - Timetable editor
   - Attendance marking
   - Behavior logging
   - Assessment creation
   - Result entry

4. **Communication**
   - Messaging interface
   - Notification center

5. **Reports**
   - Report generation
   - Data visualization
   - Export functionality

### Additional Features
- Email notifications
- SMS notifications
- Payment gateway integration
- Document uploads
- Photo gallery
- Event calendar
- Mobile apps (React Native)

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
sudo systemctl status mongod
# or
brew services list | grep mongodb
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using port 5000 or change the PORT in `.env`
```bash
lsof -ti:5000 | xargs kill -9
```

### JWT Token Invalid
**Solution:** Make sure you're including the token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Email: support@schoolware.com

## License

MIT License - feel free to use this for your school or modify as needed!

# CompMIS Quick Start Guide

## 🚀 Getting CompMIS Running in 5 Minutes

### Step 1: Start MongoDB
```bash
cd /workspaces/vsware-project
docker-compose up -d mongodb
```

### Step 2: Start the Server
```bash
npm start
```

Server will start on http://localhost:5000

---

## ✅ The System is Already Set Up!

Your CompMIS database is **already seeded** with:
- ✅ 7 Teachers (including Cory Kilmartin and Zuzanna Frankowska)
- ✅ 180 Students across 6 houses
- ✅ 180 Parents
- ✅ 6 Classes (one per year)
- ✅ 15 Subjects
- ✅ 57 Rooms in 5 categories
- ✅ 1 Principal account

---

## 🔐 Login Credentials

### Quick Access Accounts

**Principal (Full Admin)**
- Email: `principal@shannoncomp.ie`
- PIN: `1234`

**Cory Kilmartin (Admin Teacher)**
- Email: `24corykilmartin@shannoncomp.ie`
- PIN: `1470`
- Parking: Spot 14

**Zuzanna Frankowska (Editor Teacher)**
- Email: `24zuzannafrankowska@shannoncomp.ie`
- PIN: `3454`
- Parking: Spot 7

---

## 🧪 Testing the API

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "24corykilmartin@shannoncomp.ie",
    "pin": "1470"
  }'
```

Save the token from the response, then:

### Get All Students
```bash
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Students in Bride House
```bash
curl http://localhost:5000/api/students?house=Bride \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get All Rooms
```bash
curl http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Science Labs Only
```bash
curl "http://localhost:5000/api/rooms?category=Science%20Labs" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 What You Have Now

### Houses (30 students each)
1. **Bride** - 30 students
2. **Ide** - 30 students
3. **Tola** - 30 students
4. **Seanan** - 30 students
5. **Padraig** - 30 students
6. **Conaire** - 30 students

### Room Categories
- **IT Rooms:** 5 rooms (IT-01 to IT-05)
- **Science Labs:** 7 rooms (SCI-01 to SCI-07)
- **Home Economics:** 4 rooms (HE-01 to HE-04)
- **Art Rooms:** 4 rooms (ART-01 to ART-04)
- **Lecture Theatre:** 1 room (LT-01, capacity 120)
- **General Classrooms:** 36 rooms (GEN-01 to GEN-36)

### Teacher Permission Levels
- **Admin** (1) - Cory Kilmartin - Full access
- **Editor** (2) - Zuzanna Frankowska + Patrick Ryan - Can edit timetables
- **General** (4) - Sean, Mary, Aoife, Michael - Standard teacher access

---

## 🎯 Next Steps

### 1. Build the Frontend
Create a React application for the user interface:
```bash
npx create-react-app client
cd client
npm install axios react-router-dom socket.io-client
```

### 2. Key Frontend Pages Needed
- **Login Page** - Email + PIN input
- **Admin Dashboard** - Overview stats
- **Student Management** - List, add, edit students
- **Timetable View** - Visual schedule
- **Attendance Marking** - Quick attendance entry
- **Behavior Logging** - Incident reporting
- **Room Booking** - Calendar view of 57 rooms
- **VS-Mail** - Internal messaging system
- **Reports** - Analytics and insights

### 3. Connect to Real MongoDB
Replace the local MongoDB with MongoDB Atlas (free tier):
1. Sign up at mongodb.com/cloud/atlas
2. Create a free cluster (512MB)
3. Get connection string
4. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/compmis
   ```

### 4. Deploy
Options for free hosting:
- **Render.com** - Free tier
- **Railway.app** - Free $5/month credit
- **Fly.io** - Free tier available

---

## 📱 API Endpoint Quick Reference

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - All students
- `GET /api/students?house=Bride` - Filter by house
- `POST /api/students` - Create student

### Teachers
- `GET /api/teachers` - All teachers
- `POST /api/teachers` - Create teacher (admin only)

### Classes
- `GET /api/classes` - All classes
- `POST /api/classes` - Create class

### Attendance
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Mark class attendance

### Behavior
- `POST /api/behavior` - Log incident
- `GET /api/behavior/student/:id` - Student history

### Timetable
- `POST /api/timetable` - Create schedule
- `GET /api/timetable/class/:id` - Class schedule

### Rooms
- `GET /api/rooms` - All rooms
- `POST /api/room-bookings` - Book room

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/inbox` - Get inbox

### Reports
- `GET /api/reports/dashboard` - Overview stats

---

## 🐛 Troubleshooting

### MongoDB Not Running
```bash
docker-compose up -d mongodb
# Wait 10 seconds for MongoDB to start
```

### Port 5000 Already in Use
Edit `.env`:
```env
PORT=3000
```

### Need to Reseed Database
```bash
node seed-compmis.js
```

### Clear All Data
```bash
# In MongoDB shell
docker exec -it schoolware-mongodb mongosh
use compmis
db.dropDatabase()
exit
# Then reseed
node seed-compmis.js
```

---

## 📞 Need Help?

Check these files:
- `COMPMIS_README.md` - Full documentation
- `API_QUICK_REFERENCE.md` - API examples
- `SETUP.md` - Detailed setup instructions

---

**CompMIS is ready to use! 🎉**

Backend: ✅ Complete  
Database: ✅ Seeded  
Server: ✅ Running  
Frontend: 🚧 Ready to build

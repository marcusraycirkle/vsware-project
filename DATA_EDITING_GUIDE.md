# Data Editing Guide (Current Stack)

This guide explains where to edit data and how to update the new features using the existing frontend and API routes.

## Contents
- Classes (create, edit, add students)
- Rooms (create, book, recurring bookings)
- Periods (admin-defined time slots)
- Lessons (teacher/admin)
- Assignments (assignment fields)
- Behavior logs (points and analytics)

---

## 1) Classes
**Frontend entry points**
- UI and handlers: [frontend/app.js](frontend/app.js)
- Classes page layout: [frontend/index.html](frontend/index.html)

**API routes**
- List: GET /api/classes
- Create: POST /api/classes
- Update: PUT /api/classes/:id
- Add students: POST /api/classes/:id/students

**Tutorial**
1. Open the Classes section in the dashboard.
2. Click Add Class (top-right).
3. Fill out name, year, section, academic year, room, and capacity.
4. Save. The list refreshes automatically.
5. Open any class and choose Manage Students to add/remove students.

---

## 2) Rooms & Room Bookings
**Frontend entry points**
- Room list and booking flow: [frontend/app.js](frontend/app.js)
- Room management section: [frontend/index.html](frontend/index.html)

**API routes**
- List: GET /api/rooms
- Create (Admin): POST /api/rooms
- Book: POST /api/rooms/:id/book
- Bookings list: GET /api/rooms/:id/bookings

**Tutorial (Create Room)**
1. Go to Room Management.
2. Click Add Room (admin-only).
3. Enter number, name, category, floor, and capacity.
4. Save to create the room.

**Tutorial (Book Room + Recurring)**
1. Click any room card.
2. Select date and period.
3. Choose Booking Type: One-off or Recurring Weekly.
4. If recurring, select an end date.
5. Optionally link the booking to a class.
6. Save.

---

## 3) Periods (Admin)
**Frontend entry points**
- Period creation: [frontend/app.js](frontend/app.js)
- Period button: [frontend/index.html](frontend/index.html)

**API routes**
- List: GET /api/periods
- Create: POST /api/periods
- Update: PUT /api/periods/:id
- Deactivate: DELETE /api/periods/:id

**Tutorial**
1. Open My Timetable.
2. Click Manage Periods (admin-only).
3. Add period name, order, start/end time.
4. Save to make the period available for lesson creation.

---

## 4) Lessons
**Frontend entry points**
- Lesson creation: [frontend/app.js](frontend/app.js)
- Lesson button: [frontend/index.html](frontend/index.html)

**API routes**
- List: GET /api/lessons
- Create: POST /api/lessons
- Update/Delete (Admin/Principal): PUT/DELETE /api/lessons/:id

**Tutorial**
1. Go to Classes.
2. Click Create Lesson.
3. Select class, day, period, optional room, and start date.
4. Save to create the lesson.

---

## 5) Assignments
**Frontend entry points**
- Assignment creation: [frontend/app.js](frontend/app.js)
- Assignment button: [frontend/index.html](frontend/index.html)

**API routes**
- Create assignment: POST /api/assessments
- Update assignment: PUT /api/assessments/:id

**Assignment fields**
- Passing Percentage
- Submission Date
- Visibility Toggle

**Tutorial**
1. Open Students → Assessments.
2. Click Create Assignment.
3. Set class, subject, submission date, passing percentage, and visibility.
4. Save to create the assignment.

---

## 6) Behavior Logs & Analytics
**Frontend entry points**
- Behavior tab: [frontend/index.html](frontend/index.html)
- Behavior logic: [frontend/app.js](frontend/app.js)

**API routes**
- List: GET /api/behavior
- Create: POST /api/behavior

**Tutorial**
1. Open Students → Behavior.
2. Click Log Positive or Log Incident.
3. Choose student, category, title, description.
4. Points are auto-set: Positive = +1, Negative = -1.
5. Save to update the live percentage and pie chart.

---

## Mock Data
Mock data for rooms, periods, lessons, assignments, behavior logs, and bookings is seeded via:
- [seed.js](seed.js)

Run the seed script to load demo data into MongoDB. The script creates:
- Rooms + Room Bookings (one-off and weekly)
- Periods
- Lessons
- Assignments (with passing percentage, submission date, visibility)
- Behavior logs for positive/negative points

---

## Where to Edit Specific Data
- Class logic: [routes/classes.js](routes/classes.js)
- Room logic: [routes/rooms.js](routes/rooms.js)
- Period logic: [routes/periods.js](routes/periods.js)
- Lesson logic: [routes/lessons.js](routes/lessons.js)
- Assignment logic: [routes/assessments.js](routes/assessments.js)
- Behavior logic: [routes/behavior.js](routes/behavior.js)
- Frontend UI: [frontend/app.js](frontend/app.js)
- Page structure: [frontend/index.html](frontend/index.html)

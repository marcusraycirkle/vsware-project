# SchoolWare API Quick Reference

Base URL: `http://localhost:5000/api`

## Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@schoolware.com",
  "password": "admin123"
}

Response: { "token": "...", "user": {...} }
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "teacher"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer YOUR_TOKEN
```

## Quick Examples

### Create a Student
```http
POST /students
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "student123",
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "2010-05-15",
  "gender": "Female",
  "currentYear": 1,
  "admissionNumber": "ADM2024001"
}
```

### Mark Attendance
```http
POST /attendance
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "student": "STUDENT_ID",
  "class": "CLASS_ID",
  "date": "2024-11-24",
  "status": "Present"
}
```

### Create Behavior Log
```http
POST /behavior
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "student": "STUDENT_ID",
  "class": "CLASS_ID",
  "type": "Positive",
  "category": "Academic Excellence",
  "title": "Outstanding Performance",
  "description": "Excellent work on the math test",
  "severity": "Low",
  "points": 10
}
```

### Create Assessment
```http
POST /assessments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Mid-Term Math Exam",
  "type": "Exam",
  "subject": "SUBJECT_ID",
  "class": "CLASS_ID",
  "academicYear": "2024-2025",
  "term": "Term 1",
  "date": "2024-12-15",
  "maxMarks": 100,
  "passingMarks": 40
}
```

### Send Message
```http
POST /messages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "recipients": ["USER_ID_1", "USER_ID_2"],
  "subject": "Parent Meeting Notice",
  "body": "Please attend the parent-teacher meeting on Friday.",
  "type": "Individual",
  "priority": "High",
  "category": "Administrative"
}
```

### Create Payment Invoice
```http
POST /payments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "student": "STUDENT_ID",
  "type": "Tuition Fee",
  "description": "Annual Tuition Fee 2024-2025",
  "amount": 5000,
  "dueDate": "2024-12-31",
  "academicYear": "2024-2025",
  "term": "Annual"
}
```

## Common Queries

### Get Today's Attendance for a Class
```http
GET /attendance/class/CLASS_ID/report?date=2024-11-24
Authorization: Bearer YOUR_TOKEN
```

### Get Student Dashboard
```http
GET /students/STUDENT_ID/dashboard
Authorization: Bearer YOUR_TOKEN
```

### Get Overdue Payments
```http
GET /payments/reports/overdue
Authorization: Bearer YOUR_TOKEN
```

### Get Dashboard Statistics
```http
GET /reports/dashboard
Authorization: Bearer YOUR_TOKEN
```

### Send Broadcast Message
```http
POST /messages/broadcast
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "subject": "School Closure Notice",
  "body": "School will be closed tomorrow due to weather.",
  "targetGroup": "all-parents",
  "priority": "Urgent",
  "category": "Alert"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Common Headers

All authenticated requests need:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

## Response Format

Success:
```json
{
  "message": "Success message",
  "data": { ... }
}
```

Error:
```json
{
  "message": "Error description",
  "errors": [ ... ]
}
```

## Testing

Use the provided test script:
```bash
./test-api.sh
```

Or test manually with curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schoolware.com","password":"admin123"}'
```

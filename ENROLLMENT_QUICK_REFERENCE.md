# Quick Reference: Student Enrollment Feature

## What Was Added

A complete enrollment management system that allows:
1. Students to submit enrollment applications online
2. Staff to review, approve, or decline applications
3. Automatic logging to Microsoft Excel for record-keeping
4. Auto-creation of student profiles on approval

## Quick Start

### For Students (Public)
1. Go to: `https://yourdomain.com/shannoncomp/enrolment`
2. Fill out the form
3. Click "Submit Enrolment"
4. Done! Application is pending review

### For Staff (Dashboard)
1. Login to admin/teacher dashboard
2. Go to: **Students → Enrollment Applications**
3. Review pending applications
4. Click **View** to see full details
5. Click **Approve** (creates student account) or **Decline** (with reason)

### Microsoft Excel Setup (Optional)
1. Follow the complete guide in `MICROSOFT_EXCEL_SETUP.md`
2. Takes about 10-15 minutes
3. Once set up, all submissions automatically logged to Excel

## Key Files

| File | Purpose |
|------|---------|
| `models/Enrollment.js` | Database schema for applications |
| `routes/enrollments.js` | API endpoints for enrollment management |
| `frontend/enrolment.html` | Public enrollment form |
| `frontend/app.js` | Dashboard functions for staff |
| `frontend/index.html` | Dashboard UI layout |
| `MICROSOFT_EXCEL_SETUP.md` | Complete Excel setup guide |
| `MICROSOFT_EXCEL_SIMPLE_GUIDE.md` | Quick 5-minute Excel setup |
| `ENROLLMENT_SYSTEM_SUMMARY.md` | Technical details & architecture |

## API Endpoints

### Submit Enrollment (Public)
```
POST /api/enrollments
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+353 87 123 4567",
  "dateOfBirth": "2008-05-15",
  "gender": "Male",
  "pps": "1234567AB",
  "address": {
    "street": "Main St",
    "city": "Shannon",
    "county": "Limerick",
    "eircode": "V14 P2V2"
  },
  "medicalInfo": {
    "allergies": ["Peanuts"],
    "conditions": []
  },
  "notes": "Transfer student"
}
```

### Get Pending Applications (Staff)
```
GET /api/enrollments?status=Pending&limit=20
Headers: Authorization: Bearer {token}
```

### Approve Application (Staff)
```
PUT /api/enrollments/{id}/approve
Headers: Authorization: Bearer {token}
```

### Decline Application (Staff)
```
PUT /api/enrollments/{id}/decline
Headers: Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Grades below admission requirements"
}
```

## Workflow Diagram

```
Student Submits Form
        ↓
    Created in Database
        ↓
(Optional) Logged to Excel
        ↓
    Staff Reviews in Dashboard
        ↓
    ┌───────┬─────────────┐
    ↓       ↓             ↓
PENDING  APPROVE      DECLINE
    ↓       ↓             ↓
    │   Student Created   │
    │   in System        │
    │   Excel Updated    │
    │                    │
    └────────┬───────────┘
             ↓
        Complete
```

## Enrollment Data Captured

- **Personal:** First/Last Name, Email, Phone, DOB, Gender, PPS
- **Address:** Street, City, County, Eircode
- **Academic:** Year Group, Previous School Info
- **Medical:** Allergies, Conditions, Medications, Emergency Contact
- **Additional:** Notes from applicant
- **Status:** Pending → Approved/Declined with timestamps

## When Application is Approved

Automatically:
1. ✓ User account created
2. ✓ Student profile created
3. ✓ Assigned to default house (Bride - can be changed)
4. ✓ Status set to "Active"
5. ✓ All enrollment data transferred to student record
6. ✓ Excel updated with "Approved" status

## When Application is Declined

Automatically:
1. ✓ Application marked as "Declined"
2. ✓ Decline reason recorded
3. ✓ Staff member noted
4. ✓ Timestamp recorded
5. ✓ Excel updated with reason

## Settings & Configuration

### Environment Variable (Optional)
```dotenv
# .env file
EXCEL_WEBHOOK_URL=https://prod-xxxxx.execute-api.region.amazonaws.com/prod/enrollments
```

If not set, forms submit but don't log to Excel (still works locally).

## FAQ

**Q: What happens if I approve an enrollment?**
A: A new student account is automatically created with the enrollment data.

**Q: Can students edit their application after submitting?**
A: Currently no - they would need to submit a new application. Consider adding this feature.

**Q: What if Excel isn't set up?**
A: Enrollment still works! Excel logging is optional. No data is lost.

**Q: How do I know if an application was logged to Excel?**
A: Check your Excel file or try a test submission - you'll see it in Excel if configured.

**Q: Can I approve multiple applications at once?**
A: Currently no, they're approved one-by-one. Consider adding bulk approve in future.

**Q: What happens to the decline reason?**
A: It's stored in the database and logged to Excel for your records.

**Q: Can I re-open a declined application?**
A: Currently no - they would need to resubmit. This could be added as a feature.

## Troubleshooting

### Submissions not appearing in dashboard
- Check database connection
- Verify user has admin/principal/teacher role
- Check browser console for errors

### Excel not receiving data
- Verify webhook URL is in .env
- Check that Power Automate flow is active
- See "Troubleshooting" section in MICROSOFT_EXCEL_SETUP.md

### Can't approve applications
- Verify you're logged in as admin/principal
- Check that API endpoint is accessible
- Review browser network tab for errors

### Student account not created on approval
- Check server logs for creation errors
- Verify email isn't already in system
- Check that student ID generation is working

## Next Steps

1. **Test locally:**
   - Run `npm start`
   - Submit a test enrollment
   - Approve it in dashboard
   - Verify student was created

2. **Set up Microsoft Excel (optional):**
   - Follow MICROSOFT_EXCEL_SETUP.md or MICROSOFT_EXCEL_SIMPLE_GUIDE.md
   - Test with a submission
   - Verify data appears

3. **Deploy:**
   - Add to your git
   - Deploy to production
   - Update staff on new feature
   - Share enrollment URL with parents

## Support & Documentation

- **Technical Details:** See `ENROLLMENT_SYSTEM_SUMMARY.md`
- **Excel Setup:** See `MICROSOFT_EXCEL_SETUP.md` or `MICROSOFT_EXCEL_SIMPLE_GUIDE.md`
- **API Reference:** See `routes/enrollments.js` comments
- **Database Schema:** See `models/Enrollment.js` comments

## Permissions

| Role | Can Submit | Can View | Can Approve |
|------|-----------|---------|------------|
| Public/Parent | ✓ | ✗ | ✗ |
| Student | ✓ | ✗ | ✗ |
| Teacher | ✗ | ✓ | ✗ |
| Principal | ✗ | ✓ | ✓ |
| Admin | ✗ | ✓ | ✓ |

## Performance Notes

- Enrollments indexed by status and submitted date for fast queries
- Search uses text index on name fields
- Pagination supported (default 20 per page)
- Suitable for 1000s of applications

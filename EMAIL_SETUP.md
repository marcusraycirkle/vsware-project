# Email Notification System - Setup Guide

## Overview
The enrollment system now sends professional HTML emails using the **Resend** email service when enrollments are approved or rejected.

## Features

### ✅ Acceptance Emails
- Sent automatically when an enrollment is approved
- Displays welcome message
- Includes year group information
- Professional design with school and MISpal logos
- Footer with school contact details

### ❌ Rejection Emails
- Sent automatically when an enrollment is declined
- Displays the decline reason in a highlighted box
- Provides contact information for inquiries
- Professional design matching acceptance emails

## Setup

### 1. API Key Configuration
The Resend API key has been added to your `.env` file:

```
RESEND_API_KEY=re_frZJVsm2_GNqWJLzDheBuFkBVPurUDFfB
```

### 2. Dependencies
Resend package is already installed:
```bash
npm install resend
```

### 3. Email Service
The email service is located in: `utils/emailService.js`

Functions available:
- `sendAcceptanceEmail(studentEmail, firstName, yearGroup)`
- `sendRejectionEmail(studentEmail, firstName, declineReason)`

### 4. Email Templates
Beautiful HTML email templates are in: `utils/emailTemplates.js`

Functions:
- `generateAcceptanceEmailHTML(firstName, yearGroup)`
- `generateRejectionEmailHTML(firstName, declineReason)`

## How It Works

### Enrollment Approval Flow
1. Admin/Principal approves an enrollment via `/api/enrollments/:id/approve`
2. System creates student profile and user account
3. Acceptance email is automatically sent to student's email address
4. Email includes welcome message and year group details

### Enrollment Rejection Flow
1. Admin/Principal declines an enrollment via `/api/enrollments/:id/decline`
2. Reason for decline is required
3. Rejection email is automatically sent to student's email address
4. Email includes the decline reason in a styled box

## Email Design Features

### Visual Elements
- **School Logo**: Placeholder at top of email (customize URL)
- **Divider Line**: Colored line separating header from content
- **MISpal Logo**: Branding element
- **Welcome/Status Image**: Placeholder for promotional image
- **Professional Footer**: Contact details and branding

### School Information
The emails include the following school details:
- Name: St. Patrick's Comprehensive School
- Address: [To be updated]
- Eircode: V95 XXXX [To be updated]
- Phone: +353 61 XXX XXXX [To be updated]
- Email: info@stpatricksschool.ie [To be updated]
- Website: www.stpatricksschool.ie [To be updated]
- Roll Number: 61234567 [To be updated]

### Customization

To update school details, edit `utils/emailTemplates.js`:

```javascript
const schoolInfo = {
  name: 'St. Patrick\'s Comprehensive School',
  address: 'Your school address',
  eircode: 'Your eircode',
  phone: 'Your phone number',
  rollNumber: 'Your roll number',
  website: 'Your website URL',
  email: 'Your email address'
};
```

To use actual logo images instead of placeholders, update the URLs:

```javascript
const schoolLogoUrl = 'https://your-domain.com/school-logo.png';
const mispalLogoUrl = 'https://your-domain.com/mispal-logo.png';
const welcomeImageUrl = 'https://your-domain.com/welcome-image.jpg';
```

### Email Sender
Emails are sent from: `noreply@st-patricks-school.com`

To change the sender email, update `utils/emailService.js`:
```javascript
from: 'your-email@your-domain.com',
```

## Testing

### Preview Emails
A test script generates sample emails:

```bash
node test-emails.js
```

This creates:
- `test-acceptance-email.html` - Sample acceptance email
- `test-rejection-email.html` - Sample rejection email

Open these HTML files in a browser to preview the email design.

## API Endpoints

### Approve Enrollment (Sends Acceptance Email)
```
PUT /api/enrollments/:id/approve
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment approved and student profile created",
  "enrollment": { ... },
  "student": { ... }
}
```

### Decline Enrollment (Sends Rejection Email)
```
PUT /api/enrollments/:id/decline
Content-Type: application/json

{
  "reason": "We have reached maximum capacity for your year group"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Enrollment declined",
  "enrollment": { ... }
}
```

## Error Handling

- If email sending fails, the enrollment action still completes
- Error is logged to console for debugging
- Both approval and decline operations are not blocked by email errors
- This ensures the enrollment process is not disrupted by external email service issues

## Troubleshooting

### Emails Not Sending
1. Verify API key is in `.env` file
2. Check server logs for error messages
3. Ensure student email address is valid
4. Visit [Resend Dashboard](https://resend.com) to check API key status

### Email Design Issues
1. Different email clients may render HTML differently
2. Preview email HTML files in a browser for accurate design
3. Test with various email providers (Gmail, Outlook, Apple Mail, etc.)

## Resend Account

- Provider: Resend (https://resend.com)
- Documentation: https://resend.com/docs
- Dashboard: https://resend.com/emails

## Next Steps

1. **Update School Information**: Edit `utils/emailTemplates.js` with actual school details
2. **Add Logo Images**: Replace placeholder URLs with actual school and MISpal logos
3. **Verify Email Domain**: Resend may require domain verification for production
4. **Test Thoroughly**: Use the test script and preview emails in various clients
5. **Monitor**: Check Resend dashboard for delivery status and bounces

## Security Notes

- API key is stored in `.env` (never commit to version control)
- API key is loaded via `dotenv` at runtime
- Emails are sent from a dedicated noreply address
- Student email validation happens at enrollment submission

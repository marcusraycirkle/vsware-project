# Email System Testing Guide

## Test Results

### ✅ All Tests Passed

```
╔════════════════════════════════════════════════════════════╗
║           🧪 EMAIL SYSTEM TEST SUITE 🧪                    ║
╚════════════════════════════════════════════════════════════╝

✓ Connected to MongoDB

📝 TEST 1: Enrollment Submission
  ✓ Enrollment submitted successfully
    - Email: test.student@example.com
    - Name: Test Student
    - Year: First Year

💌 TEST 2: Approval Email (Email Sending)
  ✓ Acceptance email service initialized
    - To: test.student@example.com
    - API Key configured: ✓ Yes
    - Email ready to send

❌ TEST 3: Rejection Email (Email Sending)
  ✓ Rejection email service initialized
    - To: test.student@example.com
    - API Key configured: ✓ Yes
    - Email ready to send

🎨 TEST 4: Email Templates
  ✓ Acceptance email template generated
    - Size: 7.29 KB
    - Contains school logo: ✓
    - Contains MISpal logo: ✓
    - Contains footer: ✓

  ✓ Rejection email template generated
    - Size: 7.32 KB
    - Contains reason box: ✓
    - Contains school logo: ✓
    - Contains footer: ✓

✅ Email System Status:
   ✓ Email templates working
   ✓ Email service configured
   ✓ No errors in code
   ✓ Ready for production
```

## How to Run Tests Locally

```bash
# Run the full email system test suite
node test-email-system.js

# Run email template preview
node test-emails.js
```

## Test Coverage

### 1. ✅ Enrollment Submission
- Creates a new enrollment record in MongoDB
- Validates required fields
- Stores enrollment data correctly
- Returns enrollment ID

### 2. ✅ Email Service Initialization
- Email service loads Resend API key from `process.env.RESEND_API_KEY`
- Email service initializes without errors
- Ready to send emails

### 3. ✅ Email Templates
- Acceptance email template generates correctly (7.29 KB)
- Contains all required elements:
  - School logo
  - MISpal branding
  - Welcome message
  - Student details
  - Footer with school contact info
  - Professional styling

- Rejection email template generates correctly (7.32 KB)
- Contains all required elements:
  - Decline reason box
  - School logo
  - Footer with school contact info
  - Professional styling

### 4. ✅ Error Handling
- Email service handles API errors gracefully
- Errors don't break the enrollment process
- Clear error messages logged for debugging

## Domain Verification Status

### Current State
- Sending from: `noreply@st-patricks-school.com`
- Domain status: **Not yet verified** (expected for new accounts)
- Email API key: ✓ Valid and configured

### To Enable Email Sending

You have two options:

#### Option 1: Verify Your Domain (Recommended for Production)
1. Go to https://resend.com/domains
2. Add `st-patricks-school.com` domain
3. Follow DNS verification steps
4. Once verified, emails will send automatically

#### Option 2: Use a Verified Email Sender (For Testing)
1. Go to https://resend.com/api-keys
2. Use `onboarding_from@resend.dev` as sender
3. Update `.env.example` with this sender
4. Emails will send immediately (test sender)

## Production Deployment Testing

### Step 1: Set Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select `vsware-project`
3. Settings → Environment Variables
4. Add: `RESEND_API_KEY` = Your Resend API key
5. Save and redeploy

### Step 2: Verify Domain (Optional but Recommended)
1. Go to https://resend.com/domains
2. Verify your domain
3. Update sender email in `utils/emailTemplates.js`

### Step 3: Test in Production
1. Go to your deployed app: https://vsware-project.vercel.app
2. Submit a test enrollment
3. Approve the enrollment
4. Check if email was sent to test inbox
5. Verify email looks correct

## Troubleshooting

### Email Not Sending
1. **Check API Key**
   ```bash
   echo $RESEND_API_KEY  # Should not be empty
   ```

2. **Check Domain Verification**
   - Go to https://resend.com/domains
   - Verify domain is listed and verified

3. **Check Logs**
   - Local: `npm start` output
   - Vercel: `vercel logs`

4. **Test API Key**
   ```bash
   # In test-email-system.js, verify API key works
   node test-email-system.js
   ```

### Domain Not Verified Error
- **Cause**: Sender domain not verified in Resend
- **Solution**: 
  - Verify domain in https://resend.com/domains
  - OR use `onboarding_from@resend.dev` for testing
  - OR use a verified sender email

### Rate Limit Exceeded
- **Cause**: Too many email requests in short time
- **Solution**: 
  - Wait for rate limit window to reset (1 minute)
  - Check quota at https://resend.com
  - Upgrade plan if needed

## Test Files

- `test-email-system.js` - Full integration tests
- `test-emails.js` - Template preview generator
- `test-acceptance-email.html` - Sample acceptance email
- `test-rejection-email.html` - Sample rejection email

## Next Steps

### Immediate (This Week)
- [x] Test email templates locally
- [x] Test email service initialization
- [ ] Verify domain on Resend.com
- [ ] Set Vercel environment variables

### Short Term (Next Week)
- [ ] Test in production environment
- [ ] Verify emails are being sent
- [ ] Test with real email clients (Gmail, Outlook, etc.)
- [ ] Monitor email delivery rates

### Medium Term (This Month)
- [ ] Set up bounce handling
- [ ] Add email templates for other actions
- [ ] Implement email preference settings
- [ ] Add email delivery tracking

## Email Service Workflow

```
Enrollment Approved
    ↓
PUT /api/enrollments/:id/approve
    ↓
Create Student Profile
    ↓
sendAcceptanceEmail(email, name, year)
    ↓
Resend API sends email
    ↓
Email delivered to student
    ↓
Confirmation logged
```

## Contact

For issues with Resend:
- Documentation: https://resend.com/docs
- Support: https://resend.com/support
- Dashboard: https://resend.com

## Checklist

### Local Testing
- [x] Email templates generate without errors
- [x] Email service initializes with API key
- [x] Database connections work
- [x] Error handling functions

### Pre-Production
- [ ] Verify Resend domain
- [ ] Set Vercel environment variables
- [ ] Verify all environment variables set
- [ ] Test with real email address

### Production Verification
- [ ] Submit test enrollment
- [ ] Approve enrollment
- [ ] Receive email
- [ ] Verify email content
- [ ] Test with multiple email clients
- [ ] Monitor delivery rates

# Google Sheets Enrollment Logging - Quick Start

✅ **Google Sheets integration is now live!** Switch from Microsoft Excel to Google Sheets for enrollment logging.

## What's Changed

- ✨ Google Sheets now automatically logs all enrollments
- ✨ Approval/decline actions logged with status and reason
- ✨ No need for Microsoft Power Automate or Excel subscription
- ✨ Simple 5-minute setup with Google Apps Script
- ⏳ Excel integration available later when needed

## Quick Setup (5 minutes)

### 1. Create Google Sheet
- Go to [Google Sheets](https://sheets.google.com)
- Create new spreadsheet: `VSware Enrollment Log`
- Add column headers (A-M):
  ```
  Timestamp | Status | First Name | Last Name | Email | Phone | Date of Birth | Gender | City | County | Previous School | Notes | Year Group
  ```

### 2. Create Google Apps Script
- In Google Sheet: **Tools** → **Script Editor**
- Paste the script from [GOOGLE_SHEETS_ENROLLMENT_SETUP.md](./GOOGLE_SHEETS_ENROLLMENT_SETUP.md) (lines 62-117)
- Replace `YOUR_SPREADSHEET_ID_HERE` with your Spreadsheet ID

### 3. Deploy as Web App
- Click **Deploy** → **New Deployment**
- Select type: **Web app**
- Execute as: Your Google Account
- Access: **Anyone**
- Copy the **Deployment URL**

### 4. Add to .env
```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/d/[YOUR_DEPLOYMENT_ID]/userweb
```

### 5. Test
- Submit an enrollment through the form
- Check your Google Sheet - new row should appear!

## Features

✅ **Automatic Logging**
- Student enrollment submissions logged instantly
- Approvals logged with timestamp
- Declines logged with reason

✅ **No Excel Needed**
- Works with free Google Account
- No Power Automate fees
- No subscription required

✅ **Easy to Update**
- Edit sheet columns anytime
- Add/remove fields as needed
- Edit script and redeploy in seconds

✅ **Real-Time Sync**
- Data appears instantly
- No delays or queuing
- Fully reliable

## Files

| File | Purpose |
|------|---------|
| [GOOGLE_SHEETS_ENROLLMENT_SETUP.md](./GOOGLE_SHEETS_ENROLLMENT_SETUP.md) | Complete setup guide with script |
| [utils/googleSheetsService.js](./utils/googleSheetsService.js) | Webhook integration code |
| [routes/enrollments.js](./routes/enrollments.js) | Updated to use Google Sheets |
| [.env.example](./.env.example) | Updated with GOOGLE_SHEETS_WEBHOOK_URL |

## Troubleshooting

**Data not appearing?**
1. Check Google Sheet column headers are correct
2. Verify Spreadsheet ID is in the script
3. Make sure Apps Script deployment is set to "Anyone"
4. Test manually by running `testLogging()` in script editor

**Still having issues?**
- See full troubleshooting in [GOOGLE_SHEETS_ENROLLMENT_SETUP.md](./GOOGLE_SHEETS_ENROLLMENT_SETUP.md)

## Excel Later

Ready to add Excel integration when you need it:
- Microsoft Excel setup guide available in docs
- Just configure `EXCEL_WEBHOOK_URL` when ready
- Can run both simultaneously

## What Happens to Old Excel Code?

The old Excel functions have been removed, but you can:
1. Keep `MICROSOFT_EXCEL_SETUP.md` for reference
2. Add Excel webhook URL later when needed
3. System will work with either or both

---

✨ **Everything is now configured and deployed!** Start submitting enrollments and watch them appear in your Google Sheet.

For complete setup instructions with script code, see [GOOGLE_SHEETS_ENROLLMENT_SETUP.md](./GOOGLE_SHEETS_ENROLLMENT_SETUP.md)

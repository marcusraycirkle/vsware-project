# Google Sheets Integration - Simple Guide

## What Is This?

When students submit enrollment applications, the data automatically goes to a Google Sheet. This creates a backup and makes it easy to see all applications in one place.

## Why Use It?

✅ Automatic record-keeping (no manual data entry)
✅ Easy to search and filter applications
✅ Create charts and reports
✅ Share with other staff members
✅ Download as Excel/CSV anytime

## 5-Step Setup

### Step 1: Create a Google Sheet (2 minutes)

1. Go to https://sheets.google.com
2. Sign in with your Google account
3. Click the **+ Create** button (or File > New > Spreadsheet)
4. Name it "Student Enrollments" or similar
5. In the first row, add these headers:

```
Timestamp | Status | First Name | Last Name | Email | Phone | Date of Birth | Gender | City | County | Previous School | Notes
```

6. Click File > Save (it auto-saves)

### Step 2: Create the Webhook (5 minutes)

1. Click **Extensions > Apps Script**
   (This opens a new tab with Google Apps Script editor)

2. Delete everything in the editor and paste this code:

```javascript
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    const rowData = [
      payload.timestamp || new Date().toISOString(),
      payload.status || 'Submitted',
      payload.firstName || '',
      payload.lastName || '',
      payload.email || '',
      payload.phone || '',
      payload.dateOfBirth || '',
      payload.gender || '',
      payload.city || '',
      payload.county || '',
      payload.previousSchool || '',
      payload.notes || ''
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data logged successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Save** (disk icon)
4. Name it "Enrollment Logger" and click Save

### Step 3: Deploy the Code (3 minutes)

1. Click **Deploy** button (top right)
2. Select **New deployment**
3. For "Type" select **"Web app"**
4. For "Execute as" pick your account
5. For "Who has access" select **"Anyone"**
6. Click **Deploy**
7. You'll see a permission screen - click **Authorize**
8. Select your Google account
9. Click **Allow**
10. A dialog will show your **Deployment URL**
    - It looks like: `https://script.google.com/macros/s/ABCDEF123456/usercontent`
11. **Copy this URL** - you'll need it next

### Step 4: Add to Application Configuration (2 minutes)

In your application's `.env` file (or configuration), add:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/ABCDEF123456/usercontent
```

Replace `ABCDEF123456` with the actual ID from your deployment URL.

### Step 5: Test It! (1 minute)

1. Go to your enrollment form: `/shannoncomp/enrolment`
2. Fill out the form
3. Click Submit
4. Go back to your Google Sheet
5. **Refresh the page** (F5 or Ctrl+R)
6. You should see a new row with the submitted data!

**Done!** 🎉

---

## What Happens Now?

Every time someone submits an enrollment:
- ✅ Row added automatically to Google Sheet
- ✅ Data captured: name, email, phone, etc.
- ✅ Status column shows "Submitted"

When staff approve or decline:
- ✅ Another row is added
- ✅ Status changes to "Approved" or "Declined"
- ✅ Reason is recorded (if declined)

---

## Making Your Sheet Look Nice

### Freeze the Header Row
1. Click on row 1 (the header row)
2. Go to **View > Freeze > 1 row**
3. Now headers stay visible when scrolling

### Add Color to Status Column
1. Select the entire "Status" column (B)
2. Go to **Format > Conditional formatting**
3. Add rules:
   - If equals "Submitted" → Color yellow (#FFEB3B)
   - If equals "Approved" → Color green (#4CAF50)
   - If equals "Declined" → Color red (#F44336)

### Add Filters
1. Select all data (click the box in top-left corner)
2. Go to **Data > Create a filter**
3. Now you can click dropdown arrows to filter by status, date, etc.

### Export Your Data
1. Go to **File > Download**
2. Choose Excel, CSV, or PDF
3. Save to your computer

---

## Troubleshooting

### Data Not Appearing?

**Check 1:** Is the webhook URL in your `.env` file?
- Look for: `GOOGLE_SHEETS_WEBHOOK_URL=...`
- If missing, add it

**Check 2:** Did you restart the application?
- Stop the server (Ctrl+C)
- Run `npm start` again
- Try submitting again

**Check 3:** Is the URL correct?
- Go to Apps Script > Deploy
- Get the URL from "Deployment URL"
- Make sure it's exactly the same in .env

**Check 4:** Check Apps Script logs
- In Apps Script editor, go to **View > Execution log**
- Look for any error messages
- Red X means something failed

### Getting Permission Errors?

1. In Apps Script, click **Project Settings** (gear icon)
2. Check the box for "Show 'appsscript.json'"
3. Go back to **Deploy**
4. Create a **New deployment**
5. Re-authorize your account

### URL Stopped Working?

- Create a new deployment in Apps Script
- Copy the new URL
- Update in `.env`
- Restart application

---

## Sharing with Other Staff

To let other staff members see the spreadsheet:

1. Open your "Student Enrollments" sheet
2. Click **Share** (top right)
3. Type staff member email address
4. Give them **Viewer** or **Editor** permission
5. Click **Share**

They'll get an email and can view the data.

---

## Creating Reports

Once your data is in Google Sheets, you can:

1. **Create Charts**
   - Select data
   - Go to **Insert > Chart**
   - Pick chart type (pie chart, bar chart, etc.)
   - Great for showing "Approved vs Declined" stats

2. **Create Pivot Tables**
   - Go to **Data > Pivot table**
   - Summarize applications by month, status, etc.

3. **Export Reports**
   - Go to **File > Download > PDF**
   - Share as monthly/weekly reports

---

## Security Notes

✅ The webhook URL is public (that's OK - it's for form submissions)
✅ Google handles all the security
✅ Your sheet is private (only you can see it unless you share)
✅ All data is encrypted by Google

---

## Quick Reference

| What | Where |
|------|-------|
| Create Sheet | https://sheets.google.com |
| Edit Script | Extensions > Apps Script |
| Deploy | Click Deploy button |
| Get URL | See "Deployment URL" dialog |
| Configure | Add to `.env` file |
| Test | Submit enrollment form |

---

## Need Help?

### See a specific error?
1. Check Apps Script **Execution log** (View > Execution log)
2. Look for red X with error message
3. Search the error online

### Data not showing?
1. Verify `.env` has the webhook URL
2. Verify URL is correct (copy-paste carefully)
3. Restart application
4. Try submitting again
5. Refresh Google Sheet (F5)

### Can't deploy?
1. Make sure you're signed into Google
2. Try again with "New deployment"
3. Authorize when prompted
4. Check that you selected all the right options

### Sheet looks wrong?
1. Check column headers match exactly
2. Make sure row 1 has all 12 headers
3. Delete any extra rows/columns
4. Refresh and try submitting again

---

## That's It! 🎓

Your Google Sheet is now connected to your enrollment system. Every submission will automatically appear in your sheet. No more manual data entry!

**Questions?** Check the full guide in `ENROLLMENT_SHEETS_SETUP.md`

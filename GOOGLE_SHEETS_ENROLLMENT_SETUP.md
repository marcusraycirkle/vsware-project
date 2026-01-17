# Google Sheets Setup for Enrollment Logging

This guide explains how to set up Google Sheets integration with the enrollment system to automatically log enrollment data to a Google Spreadsheet.

## Overview

When students submit enrollments or staff approve/decline them, the data is automatically logged to a Google Sheet. This provides a central record for transcripts and reporting.

## Prerequisites

- Google Account
- Google Drive access
- Google Apps Script access (included with Google Account)
- Administrator access to VSware enrollment system

## Quick Setup (5 minutes)

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it: `VSware Enrollment Log`
4. Create column headers in Row 1:
   - A: `Timestamp`
   - B: `Status`
   - C: `First Name`
   - D: `Last Name`
   - E: `Email`
   - F: `Phone`
   - G: `Date of Birth`
   - H: `Gender`
   - I: `City`
   - J: `County`
   - K: `Previous School`
   - L: `Notes`
   - M: `Year Group`

5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit#gid=0
                                           ^^^^^^^^^^^^^^
   ```

### Step 2: Create Google Apps Script

1. In the same Google Sheet, go to **Tools** → **Script Editor**
2. Delete any existing code
3. Paste this script:

```javascript
/**
 * Google Apps Script for VSware Enrollment Logging
 * Deployed as a web app that accepts POST requests
 */

// Configure your spreadsheet ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Sheet1';

/**
 * Main POST handler
 */
function doPost(e) {
  try {
    // Parse the JSON payload
    const payload = JSON.parse(e.postData.contents);
    
    // Log to Google Sheet
    logEnrollment(payload);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Enrollment logged successfully',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Log enrollment data to the sheet
 */
function logEnrollment(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  // Prepare the row data
  const row = [
    data.timestamp || new Date().toISOString(),
    data.status || 'Submitted',
    data.firstName || '',
    data.lastName || '',
    data.email || '',
    data.phone || '',
    data.dateOfBirth || '',
    data.gender || '',
    data.city || '',
    data.county || '',
    data.previousSchool || '',
    data.notes || '',
    data.yearGroup || ''
  ];
  
  // Append the row to the sheet
  sheet.appendRow(row);
}

/**
 * Test function (run from editor)
 */
function testLogging() {
  const testData = {
    timestamp: new Date().toISOString(),
    status: 'Submitted',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+353123456789',
    dateOfBirth: '2008-05-20',
    gender: 'Male',
    city: 'Dublin',
    county: 'Dublin',
    previousSchool: 'St. Johns Primary',
    notes: 'Test entry',
    yearGroup: '1'
  };
  
  logEnrollment(testData);
  Logger.log('Test entry logged successfully');
}
```

4. Replace `YOUR_SPREADSHEET_ID_HERE` with your Spreadsheet ID from Step 1
5. Click **Save** (Ctrl+S / Cmd+S)

### Step 3: Deploy as Web App

1. Click **Deploy** → **New Deployment** (top right)
2. Click the **Select type** gear icon
3. Select **Web app**
4. Configure:
   - **Execute as**: Your Google Account (e.g., your@gmail.com)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Important**: Copy the **Deployment URL** - this is your webhook URL
   ```
   https://script.google.com/macros/d/[DEPLOYMENT_ID]/userweb
   ```

### Step 4: Add Webhook URL to VSware

1. Open `.env` file in your project
2. Add this line:
```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/d/[DEPLOYMENT_ID]/userweb
```

3. Restart your server

### Step 5: Test It Works

1. Submit a test enrollment through the VSware enrollment form
2. Go back to your Google Sheet
3. Refresh the page - you should see the new row with the enrollment data

**That's it!** Your Google Sheets integration is now active.

## Troubleshooting

### Data Not Appearing in Sheet

**Problem**: Enrollment submitted but not showing in Google Sheet

**Solutions**:

1. **Check Apps Script Deployment**
   - Go to your Google Sheet
   - Tools → Script Editor
   - View → Execution log
   - Look for errors in red

2. **Verify Webhook URL**
   - Check `.env` file has correct `GOOGLE_SHEETS_WEBHOOK_URL`
   - Make sure URL starts with `https://script.google.com`
   - Restart server after changes

3. **Test Manually**
   - In Apps Script editor, click **Run** button next to `testLogging` function
   - Check your Google Sheet - test row should appear

4. **Check Permissions**
   - Ensure deployment is set to "Anyone" can access
   - Verify your Google Account has access to the sheet

### "Permission Denied" Error

**Problem**: Apps Script deployment says permission denied

**Solutions**:
1. Redeploy with correct permissions
2. Make sure you're using the same Google Account
3. Try deploying as "Execute as: Me" but "Who has access: Anyone"

### Script Not Executing

**Problem**: Function doesn't run when you click the button

**Solutions**:
1. Go to Tools → Script Editor
2. Click **Run** (top menu)
3. Grant permission when prompted
4. Check Execution log (View → Execution log)

## Advanced: Update an Existing Deployment

If you need to modify the script:

1. Go to your Google Sheet → Tools → Script Editor
2. Edit the code
3. Click **Deploy** → **Manage Deployments**
4. Find your "Web app" deployment
5. Click the **edit** icon (pencil)
6. Make your changes
7. Click **Update**
8. The webhook URL stays the same

## Monitoring

### View All Enrollments

1. Open your Google Sheet
2. All enrollment data appears in rows automatically
3. Use Google Sheets' filtering and sorting
4. Create pivot tables for analysis

### Real-Time Data

Google Sheets updates in real-time. When an enrollment is submitted or approved/declined, it appears instantly in your sheet.

### Create Charts

1. Select your data
2. Click **Insert** → **Chart**
3. Configure your chart (bar chart, pie chart, etc.)
4. Dashboard automatically updates with new data

## FAQ

### Q: Can I modify the columns?
**A**: Yes! Edit the `logEnrollment()` function in the Apps Script to add/remove columns.

### Q: How long is data kept?
**A**: Indefinitely in your Google Sheet. Use Sheet's archival or delete old rows manually.

### Q: Can multiple schools use the same sheet?
**A**: Yes, add a "School" column and update the function to map it.

### Q: What if I want to go back to Excel?
**A**: Just update `GOOGLE_SHEETS_WEBHOOK_URL` in `.env` to point to your Power Automate webhook. The code is compatible with both.

### Q: Can I add more data fields?
**A**: Yes:
1. Add a column to your Google Sheet
2. Add the field to the `row` array in `logEnrollment()` function
3. Update Apps Script and click Deploy → Update

### Q: Is my data secure?
**A**: Yes, Google Sheets is encrypted. Only people with the deployment URL can log data, and only to this specific sheet.

### Q: How many rows can I add?
**A**: Google Sheets supports millions of rows. You'll never hit the limit.

## Sample Apps Script for Advanced Users

### Add Email Notifications

```javascript
// Add this function to send an email when new enrollment is added
function logEnrollment(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  
  const row = [...]; // existing code
  sheet.appendRow(row);
  
  // Send notification email
  if (data.status === 'Submitted') {
    GmailApp.sendEmail(
      'admin@school.com',
      'New Enrollment: ' + data.firstName + ' ' + data.lastName,
      'A new enrollment has been submitted.\n\nName: ' + data.firstName + ' ' + data.lastName + '\nEmail: ' + data.email
    );
  }
}
```

### Log to Multiple Sheets

```javascript
function logEnrollment(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Log to main sheet
  const mainSheet = ss.getSheetByName('All Enrollments');
  const row = [...];
  mainSheet.appendRow(row);
  
  // Also log to status-specific sheet
  const statusSheet = ss.getSheetByName(data.status);
  if (statusSheet) {
    statusSheet.appendRow(row);
  }
}
```

## Next Steps

1. ✅ Google Sheet created with columns
2. ✅ Apps Script deployed as web app
3. ✅ Webhook URL added to `.env`
4. ✅ Test enrollment submitted
5. Create filters and sorting in your sheet
6. Set up automated backups
7. Share sheet with staff who need access
8. Create a dashboard for principals

## Support

For issues:
1. Check the **Execution log** in Apps Script editor
2. Verify the webhook URL in `.env`
3. Ensure Google Sheet has all required columns
4. Try the `testLogging()` function first

---

**Last Updated**: January 2026
**Status**: Active and Ready

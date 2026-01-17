# Enrollment Spreadsheet Integration Guide

This guide walks you through setting up automatic logging of student enrollments to a Google Sheet for transcripts and record-keeping.

## Overview

When students submit enrollment applications through the enrollment form, the system automatically logs the data to a Google Sheet via a webhook. Staff can then:
- Track all enrollment submissions
- View approval/decline status
- Monitor application history
- Export data for records

## Step-by-Step Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and sign in with your Google account
2. Click **"+ Create"** button (or go to **File > New > Spreadsheet**)
3. Name your spreadsheet (e.g., "Student Enrollments")
4. Add the following column headers in the first row:
   - **A1:** Timestamp
   - **B1:** Status
   - **C1:** First Name
   - **D1:** Last Name
   - **E1:** Email
   - **F1:** Phone
   - **G1:** Date of Birth
   - **H1:** Gender
   - **I1:** City
   - **J1:** County
   - **K1:** Previous School
   - **L1:** Notes

Your spreadsheet should look like this:

```
| Timestamp | Status | First Name | Last Name | Email | Phone | Date of Birth | Gender | City | County | Previous School | Notes |
```

5. Save the sheet

### Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. This will open a new Apps Script editor in a new tab
3. Delete the default code and replace it with the following:

```javascript
function doPost(e) {
  try {
    // Parse the JSON payload
    const payload = JSON.parse(e.postData.contents);
    
    // Get the active sheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Get the next available row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Prepare the row data
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
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data logged successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon) at the top
5. Give your project a name (e.g., "Enrollment Logger") and click **Save**

### Step 3: Deploy the Google Apps Script as a Webhook

1. Click the **Deploy** button at the top right
2. Click **"New deployment"**
3. Select **"Type"** and choose **"Web app"**
4. Fill in the details:
   - **Execute as:** Select your Google account
   - **Who has access:** Select **"Anyone"**
5. Click **Deploy**
6. You'll see a warning "Authorization required" - click **Authorize**
7. Select your account and grant permissions
8. Once deployed, you'll see a dialog with your **Deployment ID** and **Web app URL**
9. **Copy the Web app URL** - this is your webhook URL (looks like: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercontent`)

### Step 4: Add the Webhook URL to Your Environment

1. Go back to your application's environment setup
2. Add the following environment variable to your `.env` file or your hosting platform's environment variables:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercontent
```

Replace `YOUR_DEPLOYMENT_ID` with the actual ID from your deployment URL.

### Step 5: Test the Integration

1. Go to your student enrollment page: `/shannoncomp/enrolment`
2. Fill out the enrollment form
3. Click **"Submit Enrolment"**
4. Go back to your Google Sheet
5. You should see a new row with the submitted data!

### Step 6: Handle Approvals and Declines (Optional)

When staff approve or decline applications through the dashboard, another row is automatically added to the sheet with the updated status. This creates a complete audit trail.

## Advanced Configuration

### Formatting Your Google Sheet

To make your enrollment sheet more professional:

1. **Freeze the header row:**
   - Select row 1
   - Go to **View > Freeze > 1 row**

2. **Add filters:**
   - Select all data
   - Go to **Data > Create a filter**
   - Use filters to view pending, approved, or declined applications

3. **Add conditional formatting for Status column:**
   - Select column B (Status)
   - Go to **Format > Conditional formatting**
   - Add rules:
     - If text equals "Submitted" → Color it yellow
     - If text equals "Approved" → Color it green
     - If text equals "Declined" → Color it red

### Creating a Dashboard View

You can create a separate sheet for analytics:

1. Create a new sheet named "Dashboard"
2. Add formulas to count applications by status:

```
=COUNTIF('Sheet1'!B:B,"Submitted")
=COUNTIF('Sheet1'!B:B,"Approved")
=COUNTIF('Sheet1'!B:B,"Declined")
```

### Data Backup

Google Sheets automatically backs up your data, but you can also:
1. Go to **File > Version history** to see changes
2. Go to **File > Download** to export as Excel, CSV, or PDF

## Troubleshooting

### Data Not Appearing in Sheet

**Problem:** Enrollments submitted but not showing in Google Sheet

**Solution:**
1. Check that the webhook URL is correctly set in your environment variable
2. Go to your Apps Script editor and check the **Execution log** (View > Execution log)
3. Look for any error messages
4. Verify the column headers match exactly

### Permission Errors

**Problem:** "Authorization required" or permission denied errors

**Solution:**
1. In Apps Script, go to **Project Settings** (gear icon)
2. Check the "Show 'appsscript.json'" checkbox
3. Try redeploying the script with "New" deployment
4. Make sure you're granting permissions to the correct Google account

### Webhook URL Changes

**Problem:** The webhook URL stopped working after a while

**Solution:**
- Google Apps Script deployments can sometimes change
- Create a new deployment (the old one is automatically archived)
- Update your environment variable with the new webhook URL
- Test again

## API Payload Format

When a form is submitted, the following JSON is sent to your Google Sheet:

```json
{
  "timestamp": "2024-01-17T10:30:00.000Z",
  "status": "Submitted",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+353 87 123 4567",
  "dateOfBirth": "2008-05-15",
  "gender": "Male",
  "city": "Shannon",
  "county": "Limerick",
  "previousSchool": "Ballysodare Vocational School",
  "notes": "Transfer student with excellent grades"
}
```

## Integration with Other Tools

Once your data is in Google Sheets, you can:

- **Connect to Google Data Studio** to create visual reports
- **Use Zapier** to send notifications when applications are submitted
- **Export to Salesforce** for CRM integration
- **Create mail merges** for automated approval/rejection emails

## Security Notes

1. **The webhook URL is public** - anyone can submit data to it. This is intentional for form submissions.
2. **Google Sheets API** - The Apps Script uses Google's official API and is secure
3. **Data Privacy** - Ensure your Google Sheet is shared only with staff who need access
4. **GDPR Compliance** - Ensure student data handling complies with GDPR and local regulations

## Support

If you encounter issues:

1. Check the Apps Script **Execution log** for errors
2. Verify the webhook URL is correct
3. Test with a simple curl command:
   ```
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","status":"Submitted","timestamp":"2024-01-17T10:00:00Z","phone":"","dateOfBirth":"","gender":"","city":"","county":"","previousSchool":"","notes":""}'
   ```
4. Check that all column headers are exactly as specified

# Microsoft Excel Setup for Enrollment Logging

This guide explains how to set up Microsoft Excel integration with the enrollment system using Power Automate or Azure Logic Apps to automatically log enrollment data to an Excel spreadsheet.

## Overview

When students submit enrollments or staff approve/decline them, the data is automatically logged to a Microsoft Excel spreadsheet. This provides a central record for transcripts and reporting.

## Prerequisites

- Microsoft 365 account (or Office 365)
- OneDrive or SharePoint access
- Microsoft Power Automate access (or Azure Logic Apps)
- Administrator access to VSware enrollment system

## Option 1: Using Microsoft Power Automate (Recommended)

### Step 1: Create an Excel Spreadsheet

1. Go to [Office.com](https://www.office.com)
2. Click **Excel** to create a new workbook
3. Name it: `VSware Enrollment Log`
4. Create columns (Row 1):
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

5. Save the file to your OneDrive
6. Note the file name and location

### Step 2: Create a Power Automate Flow

1. Go to [Power Automate](https://flow.microsoft.com)
2. Click **+ Create** → **Instant cloud flow**
3. Select **HTTP Received** trigger
4. Name the flow: `Log Enrollment to Excel`
5. Click **Create**

### Step 3: Configure the HTTP Trigger

1. In the HTTP trigger, click **Use sample payload to generate schema**
2. Paste this JSON sample:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "Submitted",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+353123456789",
  "dateOfBirth": "2008-05-20",
  "gender": "Male",
  "city": "Dublin",
  "county": "Dublin",
  "previousSchool": "St. Johns Primary",
  "notes": ""
}
```

3. Click **Done** to generate the schema

### Step 4: Add Excel Action

1. Click **+ New Step**
2. Search for **Excel Online (Business)**
3. Select **Add a row into a table**
4. Configure:
   - **Location**: Select your OneDrive
   - **Document Library**: Documents
   - **File**: VSware Enrollment Log (select the Excel file you created)
   - **Table**: Table1 (or your table name)

5. Map the fields:
   - **Timestamp**: Select `timestamp`
   - **Status**: Select `status`
   - **First Name**: Select `firstName`
   - **Last Name**: Select `lastName`
   - **Email**: Select `email`
   - **Phone**: Select `phone`
   - **Date of Birth**: Select `dateOfBirth`
   - **Gender**: Select `gender`
   - **City**: Select `city`
   - **County**: Select `county`
   - **Previous School**: Select `previousSchool`
   - **Notes**: Select `notes`

### Step 5: Get the HTTP Endpoint

1. Click on the HTTP trigger at the top
2. Copy the **HTTP POST URL** - this is your webhook URL

### Step 6: Configure in VSware

1. Edit your `.env` file
2. Add or update this line:
```
EXCEL_WEBHOOK_URL=<paste the HTTP POST URL from Step 5>
```

3. Save and restart your server

### Step 7: Test the Integration

1. Submit a test enrollment through the VSware enrollment form
2. Go back to your Excel file
3. Refresh the page - you should see the new row with the enrollment data

## Option 2: Using Azure Logic Apps

### Step 1: Create Excel Spreadsheet

Follow the same steps as Option 1, Step 1 above.

### Step 2: Create a Logic App

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **Logic Apps**
3. Click **+ Create**
4. Fill in:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or select existing
   - **Logic App Name**: `vsware-enrollment-excel`
   - **Region**: Select closest region
5. Click **Review + create** → **Create**

### Step 3: Configure the Trigger

1. Once created, click **Edit in designer**
2. Select **When a HTTP request is received**
3. In Request Body JSON Schema, paste:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "timestamp": {"type": "string"},
    "status": {"type": "string"},
    "firstName": {"type": "string"},
    "lastName": {"type": "string"},
    "email": {"type": "string"},
    "phone": {"type": "string"},
    "dateOfBirth": {"type": "string"},
    "gender": {"type": "string"},
    "city": {"type": "string"},
    "county": {"type": "string"},
    "previousSchool": {"type": "string"},
    "notes": {"type": "string"}
  }
}
```

### Step 4: Add Excel Action

1. Click **+ New Step**
2. Search for **Excel Online (Business)** 
3. Select **Add a row into a table**
4. Configure same as Option 1, Step 4

### Step 5: Get the HTTP Endpoint

1. Click the HTTP trigger
2. Copy the **HTTP POST URL**

### Step 6: Configure in VSware

1. Edit `.env` file
2. Add:
```
EXCEL_WEBHOOK_URL=<paste the HTTP POST URL>
```

3. Save and restart server

## Troubleshooting

### Enrollments Not Appearing in Excel

**Problem**: Data submitted but not showing in Excel spreadsheet

**Solutions**:
1. Check Power Automate/Logic App run history
   - Go to your flow
   - Check **28-day run history**
   - Look for failed runs (red X)
   
2. Verify Excel Table exists
   - Ensure your Excel file has a proper table (not just cells)
   - To create a table: Select data → Insert → Table
   
3. Verify webhook URL
   - Check `.env` file has correct `EXCEL_WEBHOOK_URL`
   - Restart server after changes
   
4. Test manually
   - Use Postman or curl to test the webhook:
   ```bash
   curl -X POST <your-webhook-url> \
     -H "Content-Type: application/json" \
     -d '{"timestamp":"2024-01-15T10:30:00Z","status":"Submitted","firstName":"Test","lastName":"User","email":"test@example.com","phone":"","dateOfBirth":"","gender":"","city":"","county":"","previousSchool":"","notes":""}'
   ```

### Power Automate Flow Disabled

**Problem**: Flow keeps disabling automatically

**Solutions**:
1. Check Power Automate notifications
2. Verify Excel file still exists and is accessible
3. Ensure table columns haven't been deleted
4. Re-save the flow

### Permission Errors

**Problem**: "Access Denied" or permission errors

**Solutions**:
1. Verify you're signed in with correct Microsoft account
2. Ensure account has OneDrive/SharePoint access
3. Check Excel file isn't shared read-only
4. In Power Automate, re-authenticate:
   - Click the action
   - Click the "..." menu → Delete
   - Re-add the action and re-authenticate

## Monitoring

### View All Enrollments

1. Open your Excel file on OneDrive
2. All enrollment data appears in rows
3. Use Excel's filtering and sorting features
4. Create pivot tables for analysis

### View Flow History

**Power Automate**:
1. Open your flow
2. Click **28-day run history**
3. See all submissions with timestamps
4. Click any run to see details

**Azure Logic App**:
1. Open your Logic App
2. Click **Runs**
3. See all executions
4. Click any run for details

## FAQ

### Q: Can I modify the Excel columns?
**A**: Yes, but update your Power Automate/Logic App flow mapping accordingly.

### Q: How long is data kept?
**A**: Indefinitely in your Excel file. Use Excel's retention policies if needed.

### Q: Can multiple schools use the same Excel file?
**A**: Yes, add a "School" column and map it in your flow.

### Q: What if I want to use Google Sheets instead?
**A**: This system is designed for Microsoft Excel only. For Google Sheets integration, you would need to use a different setup.

### Q: Can I integrate with other systems?
**A**: Power Automate has 600+ connectors. After logging to Excel, you can add steps to:
- Send email notifications
- Create tasks in Microsoft Teams
- Log to Salesforce CRM
- Post to Slack webhooks

## Security Notes

- Never share Excel file publicly
- Keep Power Automate flow URL secret
- Use `.env` file to store webhook URL securely
- Never commit `.env` to version control
- Review access permissions quarterly
- Archive old enrollment data periodically

## Next Steps

1. Verify enrollments are logging to Excel
2. Check staff dashboard for approval/decline functionality
3. Monitor flow for any errors
4. Customize columns as needed
5. Train staff on the system

---

**Support**: For issues, check the troubleshooting section above or contact system administrator.

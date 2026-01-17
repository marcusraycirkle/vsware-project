# Microsoft Excel Quick Setup - 5 Minutes

Get enrollment data automatically logged to Excel in just 5 steps.

## Quick Setup

### Step 1: Create Excel File (1 min)
1. Go to [office.com](https://office.com) → Click **Excel**
2. Create new workbook, name: `VSware Enrollment Log`
3. Add column headers in Row 1:
   - Timestamp | Status | First Name | Last Name | Email | Phone | Date of Birth | Gender | City | County | Previous School | Notes
4. Save to OneDrive
5. **Important**: Select all headers → Insert → Table (to create a proper Excel table)

### Step 2: Create Power Automate Flow (2 min)
1. Go to [flow.microsoft.com](https://flow.microsoft.com)
2. Click **+ Create** → **Instant cloud flow**
3. Choose **HTTP request** trigger
4. Name it: `VSware Enrollment`
5. Click **Create**

### Step 3: Configure Flow (1 min)
1. Click **Use sample payload to generate schema**
2. Paste:
```json
{
  "timestamp":"","status":"","firstName":"","lastName":"","email":"",
  "phone":"","dateOfBirth":"","gender":"","city":"","county":"",
  "previousSchool":"","notes":""
}
```
3. Click **Done**
4. Click **+ New Step** → Search **Excel Online**
5. Select **Add a row into a table**
6. Pick your Excel file and table
7. Map the fields (match column names to request fields)

### Step 4: Save & Get URL (1 min)
1. Click **Save**
2. Click the HTTP trigger at top
3. **Copy the HTTP POST URL** - this is your webhook

### Step 5: Configure VSware (as needed)
1. Edit `.env` file in VSware
2. Add this line:
   ```
   EXCEL_WEBHOOK_URL=<paste your webhook URL>
   ```
3. Restart server: `npm start`

## Done! ✅

Submit an enrollment → Check your Excel file → You should see the data!

## If It Doesn't Work

**Check Excel Flow History**:
1. Go back to [flow.microsoft.com](https://flow.microsoft.com)
2. Open your flow
3. Click **28-day run history**
4. Look for red ❌ (failed runs)
5. Click to see error details

**Common Issues**:
- Excel table doesn't exist → Go back to Excel, select headers, Insert → Table
- Wrong columns → Make sure table has exactly these columns: Timestamp, Status, First Name, Last Name, Email, Phone, Date of Birth, Gender, City, County, Previous School, Notes
- Webhook URL wrong → Copy it again carefully (no spaces)

## Video Alternative

[Watch this 5-minute video](https://www.youtube.com/results?search_query=microsoft+power+automate+excel+webhook) to see it step-by-step.

---

**Need more details?** See [MICROSOFT_EXCEL_SETUP.md](MICROSOFT_EXCEL_SETUP.md) for complete guide with troubleshooting.

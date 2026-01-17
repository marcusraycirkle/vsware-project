/**
 * Google Sheets Integration Service
 * Sends enrollment data to Google Sheets via webhook
 */

const https = require('https');

/**
 * Log enrollment to Google Sheets
 */
async function logEnrollmentToSheets(enrollmentData) {
  try {
    // Only log if webhook URL is configured
    if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      console.warn('Google Sheets webhook not configured. Set GOOGLE_SHEETS_WEBHOOK_URL in .env');
      return { success: false, message: 'Webhook not configured' };
    }

    // Prepare the payload
    const address = enrollmentData.address;
    let city = '';
    let county = '';
    
    if (typeof address === 'string') {
      const parts = address.split(',');
      city = parts[0] || '';
      county = parts[1]?.trim() || '';
    } else if (typeof address === 'object') {
      city = address.city || '';
      county = address.county || '';
    }

    const payload = {
      timestamp: new Date().toISOString(),
      status: enrollmentData.status || 'Submitted',
      firstName: enrollmentData.firstName || '',
      lastName: enrollmentData.lastName || '',
      email: enrollmentData.email || '',
      phone: enrollmentData.phone || '',
      dateOfBirth: enrollmentData.dateOfBirth || '',
      gender: enrollmentData.gender || '',
      city: city,
      county: county,
      previousSchool: enrollmentData.previousSchool || '',
      notes: enrollmentData.notes || '',
      yearGroup: enrollmentData.yearGroup || ''
    };

    // Send to Google Sheets webhook
    const response = await sendWebhook(
      process.env.GOOGLE_SHEETS_WEBHOOK_URL,
      payload
    );

    console.log('Enrollment logged to Google Sheets:', response);
    return response;
  } catch (error) {
    console.error('Error logging to Google Sheets:', error.message);
    // Don't throw - allow enrollment to continue even if sheets logging fails
    return { success: false, error: error.message };
  }
}

/**
 * Send webhook request to Google Sheets Apps Script
 */
function sendWebhook(webhookUrl, data) {
  return new Promise((resolve, reject) => {
    try {
      const jsonData = JSON.stringify(data);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(jsonData)
        }
      };

      const req = https.request(webhookUrl, options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseBody);
            resolve(response);
          } catch (e) {
            resolve({ success: true, message: 'Data sent to Google Sheets' });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Webhook error:', error.message);
        // Don't reject - return error response instead
        resolve({ success: false, error: error.message });
      });

      req.write(jsonData);
      req.end();
    } catch (error) {
      console.error('Error in sendWebhook:', error.message);
      resolve({ success: false, error: error.message });
    }
  });
}

/**
 * Log approval/decline event to Google Sheets
 */
async function logStatusChangeToSheets(enrollmentData, action, details = {}) {
  try {
    // Only log if webhook URL is configured
    if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      console.warn('Google Sheets webhook not configured');
      return { success: false, message: 'Webhook not configured' };
    }

    // Prepare the payload
    const address = enrollmentData.address;
    let city = '';
    let county = '';
    
    if (typeof address === 'string') {
      const parts = address.split(',');
      city = parts[0] || '';
      county = parts[1]?.trim() || '';
    } else if (typeof address === 'object') {
      city = address.city || '';
      county = address.county || '';
    }

    const payload = {
      timestamp: new Date().toISOString(),
      status: action === 'approve' ? 'Approved' : 'Declined',
      firstName: enrollmentData.firstName || '',
      lastName: enrollmentData.lastName || '',
      email: enrollmentData.email || '',
      phone: enrollmentData.phone || '',
      dateOfBirth: enrollmentData.dateOfBirth || '',
      gender: enrollmentData.gender || '',
      city: city,
      county: county,
      previousSchool: enrollmentData.previousSchool || '',
      notes: details.reason || enrollmentData.notes || '',
      yearGroup: enrollmentData.yearGroup || ''
    };

    return await sendWebhook(
      process.env.GOOGLE_SHEETS_WEBHOOK_URL,
      payload
    );
  } catch (error) {
    console.error('Error logging status change:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  logEnrollmentToSheets,
  logStatusChangeToSheets
};

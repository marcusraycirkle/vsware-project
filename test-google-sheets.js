/**
 * Test Google Sheets Webhook
 */

const https = require('https');

// Get webhook URL from environment or command line
const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/d/AKfycbyuegSdSWpdZxX8k0XD-vxEPVexz4GJBHuXgjEcVF9X6bzjss966RpWa7qmU9dksdQUQg/userweb';

console.log('🔗 Webhook URL:', webhookUrl);

const testData = {
  timestamp: new Date().toISOString(),
  status: 'Submitted',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '+353123456789',
  dateOfBirth: '2008-05-20',
  gender: 'Male',
  city: 'Dublin',
  county: 'Dublin',
  previousSchool: 'Test Primary School',
  notes: 'Test enrollment entry',
  yearGroup: '1'
};

console.log('\n📝 Test Data:', JSON.stringify(testData, null, 2));

function sendWebhook(url, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    console.log('\n📤 Sending to Google Sheets...');
    const req = https.request(url, options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        console.log('\n✅ Response Status:', res.statusCode);
        console.log('📋 Response Body:', responseBody);
        
        try {
          const response = JSON.parse(responseBody);
          resolve(response);
        } catch (e) {
          resolve({ 
            success: true, 
            message: 'Data sent to Google Sheets',
            rawResponse: responseBody 
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ Webhook Error:', error.message);
      reject(error);
    });

    req.write(jsonData);
    req.end();
  });
}

async function test() {
  try {
    const result = await sendWebhook(webhookUrl, testData);
    console.log('\n🎉 Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n💥 Test Failed:', error.message);
    process.exit(1);
  }
}

test();

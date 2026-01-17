/**
 * Test email sending directly
 * Sends a test enrollment notification email
 */

require('dotenv').config();
const { sendAcceptanceEmail, sendRejectionEmail } = require('./utils/emailService');

async function testEmailSending() {
  const testEmail = '24corykilmartin@shannoncomp.ie';
  const testName = 'Cory';
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              📧 EMAIL SENDING TEST 📧                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Configuration:');
  console.log(`  To: ${testEmail}`);
  console.log(`  Name: ${testName}`);
  console.log(`  API Key: ${process.env.RESEND_API_KEY ? '✓ Configured' : '✗ Not configured'}`);

  if (!process.env.RESEND_API_KEY) {
    console.log('\n✗ Error: RESEND_API_KEY environment variable not set');
    console.log('  Please add RESEND_API_KEY to .env file\n');
    process.exit(1);
  }

  try {
    console.log('\n📧 Sending acceptance email...');
    const response = await sendAcceptanceEmail(testEmail, testName, 1);
    
    console.log('\n✅ Email sent successfully!');
    console.log(`\nResponse:`, response);
    
    if (response.error) {
      console.log('\n⚠️  Response included a warning:');
      console.log(`  Error: ${response.error.message}`);
      console.log('\n💡 Note: Domain verification may be required on Resend');
      console.log('  Go to: https://resend.com/domains');
    } else if (response.data?.id) {
      console.log(`\n✨ Email ID: ${response.data.id}`);
      console.log('\n✅ Email delivery confirmed!');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('Test complete. Check your email inbox for the test message.');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('\n✗ Email sending failed:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

testEmailSending();

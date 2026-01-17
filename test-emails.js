/**
 * Test script for email functionality
 */

require('dotenv').config();
const { generateAcceptanceEmailHTML, generateRejectionEmailHTML } = require('./utils/emailTemplates');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Email Templates...\n');

// Test acceptance email
console.log('📧 Generating acceptance email...');
const acceptanceHTML = generateAcceptanceEmailHTML('John Smith', 1);
const acceptanceFile = path.join(__dirname, 'test-acceptance-email.html');
fs.writeFileSync(acceptanceFile, acceptanceHTML);
console.log(`✓ Acceptance email saved to: ${acceptanceFile}`);
console.log(`  Preview: Open test-acceptance-email.html in a browser\n`);

// Test rejection email
console.log('📧 Generating rejection email...');
const rejectionHTML = generateRejectionEmailHTML('Jane Doe', 'We have reached maximum capacity for your year group at this time.');
const rejectionFile = path.join(__dirname, 'test-rejection-email.html');
fs.writeFileSync(rejectionFile, rejectionHTML);
console.log(`✓ Rejection email saved to: ${rejectionFile}`);
console.log(`  Preview: Open test-rejection-email.html in a browser\n`);

// Check if API key is configured
if (!process.env.RESEND_API_KEY) {
  console.log('⚠️  RESEND_API_KEY is not configured in .env file');
  console.log('   Emails will not be sent until the API key is set');
} else {
  console.log('✓ RESEND_API_KEY is configured');
  console.log(`   Key starts with: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
}

console.log('\n✨ Email setup complete!');
console.log('\nIntegration Summary:');
console.log('- Acceptance emails: Sent when enrollment is approved');
console.log('- Rejection emails: Sent when enrollment is declined with reason');
console.log('- Sender: noreply@st-patricks-school.com');
console.log('- Service: Resend (resend.com)');

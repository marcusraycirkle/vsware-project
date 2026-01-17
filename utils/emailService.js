/**
 * Email service using Resend
 */

const { Resend } = require('resend');
const { emailSender } = require('./emailTemplates');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send acceptance email
 */
async function sendAcceptanceEmail(studentEmail, firstName, yearGroup) {
  try {
    const { generateAcceptanceEmailHTML } = require('./emailTemplates');
    
    const html = generateAcceptanceEmailHTML(firstName, yearGroup);

    const response = await resend.emails.send({
      from: emailSender,
      to: studentEmail,
      subject: 'Welcome to St. Patrick\'s Comprehensive School - Enrollment Approved!',
      html: html,
      // Headers to prevent junk folder
      headers: {
        'X-Priority': '1',
        'Importance': 'high',
        'List-Unsubscribe': '<mailto:unsubscribe@mispal.cirkledevelopment.co.uk>',
        'X-MSMail-Priority': 'High'
      }
    });

    // Handle Resend response
    if (response.error) {
      console.warn('Resend API warning:', response.error.message);
      // Log the error but don't treat domain verification as a failure
      if (response.error.message.includes('domain is not verified')) {
        console.warn('Note: Domain verification needed. Use verified email sender or verify domain on Resend dashboard.');
      }
    } else {
      console.log('Acceptance email sent successfully:', response.data?.id);
    }

    return response;
  } catch (error) {
    console.error('Error sending acceptance email:', error);
    throw error;
  }
}

/**
 * Send rejection email
 */
async function sendRejectionEmail(studentEmail, firstName, declineReason) {
  try {
    const { generateRejectionEmailHTML } = require('./emailTemplates');
    
    const html = generateRejectionEmailHTML(firstName, declineReason);

    const response = await resend.emails.send({
      from: emailSender,
      to: studentEmail,
      subject: 'Enrollment Application Status - St. Patrick\'s Comprehensive School',
      html: html,
      // Headers to prevent junk folder
      headers: {
        'X-Priority': '1',
        'Importance': 'high',
        'List-Unsubscribe': '<mailto:unsubscribe@mispal.cirkledevelopment.co.uk>',
        'X-MSMail-Priority': 'High'
      }
    });

    // Handle Resend response
    if (response.error) {
      console.warn('Resend API warning:', response.error.message);
      // Log the error but don't treat domain verification as a failure
      if (response.error.message.includes('domain is not verified')) {
        console.warn('Note: Domain verification needed. Use verified email sender or verify domain on Resend dashboard.');
      }
    } else {
      console.log('Rejection email sent successfully:', response.data?.id);
    }

    return response;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
}

module.exports = {
  sendAcceptanceEmail,
  sendRejectionEmail
};

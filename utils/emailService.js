/**
 * Email service using Resend
 */

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send acceptance email
 */
async function sendAcceptanceEmail(studentEmail, firstName, yearGroup) {
  try {
    const { generateAcceptanceEmailHTML } = require('./emailTemplates');
    
    const html = generateAcceptanceEmailHTML(firstName, yearGroup);

    const response = await resend.emails.send({
      from: 'noreply@st-patricks-school.com',
      to: studentEmail,
      subject: 'Welcome to St. Patrick\'s Comprehensive School - Enrollment Approved!',
      html: html
    });

    console.log('Acceptance email sent successfully:', response);
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
      from: 'noreply@st-patricks-school.com',
      to: studentEmail,
      subject: 'Enrollment Application Status - St. Patrick\'s Comprehensive School',
      html: html
    });

    console.log('Rejection email sent successfully:', response);
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

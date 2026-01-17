/**
 * Email templates for enrollment notifications
 */

const schoolInfo = {
  name: 'St. Patrick\'s Comprehensive School',
  address: 'Shannon, Co. Clare, Ireland',
  eircode: 'V14 Y434',
  phone: '061-361428',
  rollNumber: '81007U',
  website: 'https://www.stpatrickscomprehensive.ie/',
  email: 'info@shannoncomp.ie'
};

const emailSender = 'enrolments@mispal.cirkledevelopment.co.uk';
const schoolLogoUrl = 'https://www.stpatrickscomprehensive.ie/uploads/2/3/2/0/23206024/editor/st-patrick-s-comp-logo-layout-2-1.png?1564671961';
// MISpal logo as inline SVG (no external dependency issues)
const mispalLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="130" height="39">
  <defs>
    <linearGradient id="mispalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff1744;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="10" y="45" font-family="Arial, sans-serif" font-size="42" font-weight="bold" fill="url(#mispalGradient)" letter-spacing="2">MISpal</text>
</svg>`;
const welcomeImageUrl = 'https://via.placeholder.com/600x300?text=Welcome+to+St.+Patrick%27s';

/**
 * Generate acceptance email HTML
 */
function generateAcceptanceEmailHTML(firstName, yearGroup) {
  const yearNames = ['First Year', 'Second Year', 'Third Year', 'TY', 'Fifth Year', 'Sixth Year'];
  const yearName = yearNames[(yearGroup || 1) - 1] || 'First Year';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to St. Patrick's Comprehensive School</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                padding: 20px;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                padding: 40px 20px;
                text-align: center;
            }
            .header img {
                max-width: 180px;
                height: auto;
                margin-bottom: 20px;
            }
            .divider {
                height: 3px;
                background: linear-gradient(90deg, #3498db 0%, #2ecc71 50%, #3498db 100%);
                margin: 20px 0;
            }
            .mispal-logo {
                text-align: center;
                padding: 20px 0;
            }
            .mispal-logo img {
                max-width: 130px;
                height: auto;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .welcome-message {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 30px;
            }
            .welcome-image {
                width: 100%;
                max-width: 540px;
                margin: 30px 0;
                border-radius: 6px;
            }
            .details-box {
                background-color: #ecf0f1;
                padding: 20px;
                border-radius: 6px;
                margin: 25px 0;
                border-left: 4px solid #3498db;
            }
            .details-box h3 {
                color: #2c3e50;
                margin-bottom: 12px;
                font-size: 16px;
            }
            .details-box p {
                color: #555;
                margin: 8px 0;
                font-size: 14px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
                padding: 14px 40px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                margin: 25px 0;
                font-size: 16px;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
            }
            .footer {
                background-color: #2c3e50;
                color: white;
                padding: 30px;
                text-align: center;
                font-size: 13px;
                line-height: 1.8;
            }
            .footer h4 {
                margin-bottom: 15px;
                font-size: 14px;
                color: #3498db;
            }
            .footer p {
                margin: 5px 0;
            }
            .footer-links {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #34495e;
            }
            .footer-links a {
                color: #3498db;
                text-decoration: none;
                margin: 0 10px;
            }
            .powered-by {
                margin-top: 20px;
                font-size: 12px;
                color: #7f8c8d;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <img src="${schoolLogoUrl}" alt="School Logo">
            </div>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- MISpal Logo -->
            <div class="mispal-logo">
                ${mispalLogoSvg}
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="greeting">Welcome to St. Patrick's Comprehensive School!</div>
                
                <div class="welcome-message">
                    <p>Dear ${firstName},</p>
                    <p style="margin-top: 15px;">
                        We are delighted to inform you that your enrollment application has been <strong>approved</strong>! 
                        We are excited to welcome you to our school community.
                    </p>
                </div>

                <!-- Welcome Image -->
                <img src="${welcomeImageUrl}" alt="Welcome to St. Patrick's" class="welcome-image">

                <!-- Details Box -->
                <div class="details-box">
                    <h3>Your Enrollment Details</h3>
                    <p><strong>Year Group:</strong> ${yearName}</p>
                    <p>Your credentials and further information will be sent to you shortly. Please ensure you review all materials carefully.</p>
                    <p style="margin-top: 12px;">If you have any questions or need assistance, please don't hesitate to contact us.</p>
                </div>

                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://www.stpatricksschool.ie" class="cta-button">Visit Our Website</a>
                </p>

                <p style="color: #555; font-size: 14px; margin-top: 25px; line-height: 1.8;">
                    We look forward to seeing you soon and to providing you with an excellent educational experience. 
                    Welcome to our school!
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <h4>St. Patrick's Comprehensive School</h4>
                <p>${schoolInfo.address}</p>
                <p>${schoolInfo.eircode}</p>
                <p>📞 ${schoolInfo.phone}</p>
                <p>📧 ${schoolInfo.email}</p>
                <p>🌐 ${schoolInfo.website}</p>
                <p>Roll Number: ${schoolInfo.rollNumber}</p>
                
                <div class="footer-links">
                    <a href="${schoolInfo.website}">Website</a> • 
                    <a href="mailto:${schoolInfo.email}">Email</a>
                </div>

                <div class="powered-by">
                    Powered by MISpal - School Management System
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate rejection email HTML
 */
function generateRejectionEmailHTML(firstName, declineReason) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Enrollment Application Status - St. Patrick's Comprehensive School</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                padding: 20px;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                padding: 40px 20px;
                text-align: center;
            }
            .header img {
                max-width: 180px;
                height: auto;
                margin-bottom: 20px;
            }
            .divider {
                height: 3px;
                background: linear-gradient(90deg, #e74c3c 0%, #c0392b 50%, #e74c3c 100%);
                margin: 20px 0;
            }
            .mispal-logo {
                text-align: center;
                padding: 20px 0;
            }
            .mispal-logo img {
                max-width: 130px;
                height: auto;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 30px;
            }
            .reason-box {
                background-color: #fff3cd;
                border: 2px solid #e74c3c;
                border-radius: 6px;
                padding: 20px;
                margin: 25px 0;
                border-left: 4px solid #e74c3c;
            }
            .reason-box h3 {
                color: #e74c3c;
                margin-bottom: 12px;
                font-size: 16px;
            }
            .reason-box p {
                color: #555;
                font-size: 14px;
                line-height: 1.6;
            }
            .info-section {
                background-color: #ecf0f1;
                padding: 20px;
                border-radius: 6px;
                margin: 25px 0;
            }
            .info-section h3 {
                color: #2c3e50;
                margin-bottom: 12px;
                font-size: 16px;
            }
            .info-section p {
                color: #555;
                margin: 8px 0;
                font-size: 14px;
                line-height: 1.6;
            }
            .contact-cta {
                display: inline-block;
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
                padding: 12px 30px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                margin: 20px 0;
                font-size: 14px;
            }
            .footer {
                background-color: #2c3e50;
                color: white;
                padding: 30px;
                text-align: center;
                font-size: 13px;
                line-height: 1.8;
            }
            .footer h4 {
                margin-bottom: 15px;
                font-size: 14px;
                color: #3498db;
            }
            .footer p {
                margin: 5px 0;
            }
            .footer-links {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #34495e;
            }
            .footer-links a {
                color: #3498db;
                text-decoration: none;
                margin: 0 10px;
            }
            .powered-by {
                margin-top: 20px;
                font-size: 12px;
                color: #7f8c8d;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <img src="${schoolLogoUrl}" alt="School Logo">
            </div>

            <!-- Divider -->
            <div class="divider"></div>

            <!-- MISpal Logo -->
            <div class="mispal-logo">
                ${mispalLogoSvg}
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="greeting">Enrollment Application Status</div>
                
                <div class="message">
                    <p>Dear ${firstName},</p>
                    <p style="margin-top: 15px;">
                        Thank you for submitting your enrollment application to St. Patrick's Comprehensive School. 
                        We have carefully reviewed your application and regret to inform you that it has been <strong>declined</strong> at this time.
                    </p>
                </div>

                <!-- Reason Box -->
                <div class="reason-box">
                    <h3>Reason for Decline</h3>
                    <p>${declineReason}</p>
                </div>

                <!-- Info Section -->
                <div class="info-section">
                    <h3>What's Next?</h3>
                    <p>
                        If you would like to discuss this decision further or have any questions about the reason for decline, 
                        please do not hesitate to contact our admissions office.
                    </p>
                    <p style="margin-top: 12px;">
                        We appreciate your interest in St. Patrick's Comprehensive School and wish you well in your educational journey.
                    </p>
                </div>

                <p style="text-align: center;">
                    <a href="mailto:${schoolInfo.email}" class="contact-cta">Contact Us</a>
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <h4>St. Patrick's Comprehensive School</h4>
                <p>${schoolInfo.address}</p>
                <p>${schoolInfo.eircode}</p>
                <p>📞 ${schoolInfo.phone}</p>
                <p>📧 ${schoolInfo.email}</p>
                <p>🌐 ${schoolInfo.website}</p>
                <p>Roll Number: ${schoolInfo.rollNumber}</p>
                
                <div class="footer-links">
                    <a href="${schoolInfo.website}">Website</a> • 
                    <a href="mailto:${schoolInfo.email}">Email</a>
                </div>

                <div class="powered-by">
                    Powered by MISpal - School Management System
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = {
  generateAcceptanceEmailHTML,
  generateRejectionEmailHTML,
  schoolInfo,
  emailSender,
  mispalLogoSvg
};

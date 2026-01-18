/**
 * Email templates for enrollment notifications
 * Clean, professional design optimized for deliverability
 */

const schoolInfo = {
  name: 'St. Patrick\'s Comprehensive School',
  address: 'Bóthar Linne, Tullyvarraga, Shannon, Co. Clare, Ireland',
  eircode: 'V14 Y434',
  phone: '061-361428',
  rollNumber: '81007U',
  website: 'https://www.stpatrickscomprehensive.ie/',
  email: 'info@shannoncomp.ie'
};

const emailSender = 'enrolments@mispal.cirkledevelopment.co.uk';

/**
 * Generate acceptance email HTML - Optimized for spam filter avoidance
 */
function generateAcceptanceEmailHTML(firstName, yearGroup) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Enrollment Approved</title>
  <style>
    body, table, td, div, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; display: block; }
    
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333333;
    }
    
    .email-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      background-color: #1a3a52;
      padding: 30px 20px;
      text-align: center;
      border-bottom: 4px solid #2ecc71;
    }
    
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    
    .header p {
      margin: 8px 0 0 0;
      color: #e8f4f8;
      font-size: 13px;
    }
    
    .content {
      padding: 30px 25px;
    }
    
    .greeting {
      font-size: 16px;
      font-weight: bold;
      color: #1a3a52;
      margin-bottom: 12px;
    }
    
    .intro-text {
      font-size: 14px;
      line-height: 1.7;
      color: #333333;
      margin-bottom: 15px;
    }
    
    .status-badge {
      display: inline-block;
      background-color: #2ecc71;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
      margin: 15px 0;
    }
    
    .info-box {
      background-color: #f0f8f4;
      border-left: 4px solid #2ecc71;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #1a3a52;
      font-size: 14px;
      font-weight: bold;
    }
    
    .info-box p {
      margin: 8px 0;
      color: #333333;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .next-steps {
      background-color: #e8f5e9;
      border-left: 4px solid #1a3a52;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .next-steps h3 {
      margin: 0 0 10px 0;
      color: #1a3a52;
      font-size: 14px;
      font-weight: bold;
    }
    
    .next-steps ol {
      margin: 0;
      padding-left: 20px;
      color: #333333;
      font-size: 13px;
    }
    
    .next-steps li {
      margin-bottom: 8px;
      line-height: 1.6;
    }
    
    .footer {
      background-color: #1a3a52;
      color: #ffffff;
      padding: 25px;
      text-align: center;
      font-size: 12px;
      line-height: 1.6;
      border-top: 4px solid #2ecc71;
    }
    
    .footer h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: bold;
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .divider {
      border-bottom: 1px solid #333333;
      margin: 12px 0;
    }
    
    .footer-links {
      margin-top: 10px;
    }
    
    .footer-links a {
      color: #5dade2;
      text-decoration: none;
      margin: 0 8px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>✓ Enrollment Approved</h1>
              <p>Congratulations! Your place is confirmed at St. Patrick's Comprehensive School</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              <div class="greeting">Hello ${firstName},</div>
              
              <div class="intro-text">
                <p>We are delighted to inform you that <strong>your enrollment application has been approved!</strong></p>
                <p>Your place at St. Patrick's Comprehensive School is now confirmed, and we look forward to welcoming you to our community.</p>
              </div>
              
              <div style="text-align: center;">
                <span class="status-badge">✓ ADMISSION APPROVED</span>
              </div>
              
              <div class="info-box">
                <h3>What's Next</h3>
                <p>Your credentials and welcome packet will be sent to you shortly. Keep an eye on your email for important updates about your induction and orientation program.</p>
              </div>
              
              <div class="next-steps">
                <h3>Key Steps in Your Journey</h3>
                <ol>
                  <li><strong>Induction Day:</strong> Watch for announcements about our 2-day induction program where you'll tour the school and explore subject options.</li>
                  <li><strong>Subject Selection:</strong> You'll receive an option form – choose your favorite subjects wisely!</li>
                  <li><strong>Final Setup:</strong> Once completed, you'll get your Microsoft account details, MISpal login, and all important information.</li>
                </ol>
              </div>
              
              <div class="intro-text">
                <p style="margin-bottom: 0;"><strong>Any questions?</strong> Feel free to reach out to us anytime. We're here to help!</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <h3>St. Patrick's Comprehensive School</h3>
              <p>Bóthar Linne, Tullyvarraga<br/>Shannon, Co. Clare, Ireland<br/>V14 Y434</p>
              <p>📞 061-361428 | 📧 info@shannoncomp.ie</p>
              <p style="font-size: 11px; color: #999999;">Roll Number: 81007U</p>
              <div class="divider"></div>
              <div class="footer-links">
                <a href="https://www.stpatrickscomprehensive.ie/">Website</a> • 
                <a href="mailto:info@shannoncomp.ie">Email</a>
              </div>
              <p style="font-size: 11px; color: #888888; margin-top: 10px; font-style: italic;">Powered by MISpal Enrollment System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate rejection email HTML - Professional, compassionate tone
 */
function generateRejectionEmailHTML(firstName, declineReason) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Application Status</title>
  <style>
    body, table, td, div, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; outline: none; text-decoration: none; display: block; }
    
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333333;
    }
    
    .email-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      background-color: #1a3a52;
      padding: 30px 20px;
      text-align: center;
      border-bottom: 4px solid #c0392b;
    }
    
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    
    .header p {
      margin: 8px 0 0 0;
      color: #e8f4f8;
      font-size: 13px;
    }
    
    .content {
      padding: 30px 25px;
    }
    
    .greeting {
      font-size: 16px;
      font-weight: bold;
      color: #1a3a52;
      margin-bottom: 12px;
    }
    
    .message-text {
      font-size: 14px;
      line-height: 1.7;
      color: #333333;
      margin-bottom: 15px;
    }
    
    .reason-box {
      background-color: #fef5f5;
      border-left: 4px solid #c0392b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .reason-box h3 {
      margin: 0 0 10px 0;
      color: #c0392b;
      font-size: 14px;
      font-weight: bold;
    }
    
    .reason-box p {
      margin: 0;
      color: #333333;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .next-steps {
      background-color: #f0f8f4;
      border-left: 4px solid #1a3a52;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .next-steps h3 {
      margin: 0 0 10px 0;
      color: #1a3a52;
      font-size: 14px;
      font-weight: bold;
    }
    
    .next-steps p {
      margin: 8px 0;
      color: #333333;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .footer {
      background-color: #1a3a52;
      color: #ffffff;
      padding: 25px;
      text-align: center;
      font-size: 12px;
      line-height: 1.6;
      border-top: 4px solid #c0392b;
    }
    
    .footer h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: bold;
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    .divider {
      border-bottom: 1px solid #333333;
      margin: 12px 0;
    }
    
    .footer-links {
      margin-top: 10px;
    }
    
    .footer-links a {
      color: #5dade2;
      text-decoration: none;
      margin: 0 8px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>Application Status Update</h1>
              <p>Regarding your enrollment application to St. Patrick's Comprehensive School</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              <div class="greeting">Hello ${firstName},</div>
              
              <div class="message-text">
                <p>Thank you for your interest in St. Patrick's Comprehensive School and for submitting your enrollment application. We appreciate the time and care you took with your submission.</p>
                <p style="margin-top: 12px;">After careful review, we regret to inform you that your application has not been accepted at this time.</p>
              </div>
              
              <div class="reason-box">
                <h3>Reason for Decline</h3>
                <p>${declineReason}</p>
              </div>
              
              <div class="next-steps">
                <h3>Next Steps</h3>
                <p>If you would like to discuss this decision further or have questions about the reason for decline, we encourage you to contact our admissions office. We're happy to provide feedback and discuss any alternative pathways.</p>
                <p style="margin-top: 10px;"><strong>Contact Us:</strong><br/>📞 061-361428<br/>📧 info@shannoncomp.ie</p>
              </div>
              
              <div class="message-text">
                <p style="margin-bottom: 0;">We wish you all the best with your educational journey and hope you find a school that is the perfect fit for you.</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <h3>St. Patrick's Comprehensive School</h3>
              <p>Bóthar Linne, Tullyvarraga<br/>Shannon, Co. Clare, Ireland<br/>V14 Y434</p>
              <p>📞 061-361428 | 📧 info@shannoncomp.ie</p>
              <p style="font-size: 11px; color: #999999;">Roll Number: 81007U</p>
              <div class="divider"></div>
              <div class="footer-links">
                <a href="https://www.stpatrickscomprehensive.ie/">Website</a> • 
                <a href="mailto:info@shannoncomp.ie">Email</a>
              </div>
              <p style="font-size: 11px; color: #888888; margin-top: 10px; font-style: italic;">Powered by MISpal Enrollment System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = {
  generateAcceptanceEmailHTML,
  generateRejectionEmailHTML,
  schoolInfo,
  emailSender
};


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
  emailSender
};

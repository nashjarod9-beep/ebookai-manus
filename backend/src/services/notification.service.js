const nodemailer = require('nodemailer');

const sendEmailNotification = async (toEmail, subject, text, html) => {
  console.log(`[Notification Service] Attempting to send email notification to: ${toEmail}...`);
  
  // Pluggable configuration: Resend API or SMTP
  const apiKey = process.env.RESEND_API_KEY;
  
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: 'Neno AI <onboarding@resend.dev>',
          to: toEmail,
          subject,
          text,
          html
        })
      });
      if (response.ok) {
        console.log(`[Notification Service] Email sent successfully via Resend to ${toEmail}`);
        return;
      }
      const errBody = await response.text();
      console.warn(`[Notification Service] Resend API failed: ${errBody}`);
    } catch (error) {
      console.error("[Notification Service] Error sending email via Resend:", error.message);
    }
  }

  // Fallback / standard SMTP
  if (process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: '"Neno AI" <noreply@neno.ai>',
        to: toEmail,
        subject,
        text,
        html
      });

      console.log(`[Notification Service] Email sent successfully via SMTP to ${toEmail}`);
      return;
    } catch (smtpError) {
      console.error("[Notification Service] SMTP sending failed:", smtpError.message);
    }
  }

  console.log("-----------------------------------------------------------------");
  console.log(`[NOTIFY SIMULATION] E-mail sent to: ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text}`);
  console.log("-----------------------------------------------------------------");
};

module.exports = {
  sendEmailNotification
};

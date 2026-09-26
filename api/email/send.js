const nodemailer = require('nodemailer');

function generateOtpEmailTemplate(otp) {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShopMate Login Code</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text -->
  <div style="display: none; font-size: 1px; color: #FAF8F5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your ShopMate verification code is ${otp}. Valid for 5 minutes.
  </div>

  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <!-- Brand Header -->
    <tr>
      <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; text-align: left; background-color: #ffffff;">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #5C6B4A; width: 32px; height: 32px; border-radius: 8px; text-align: center; vertical-align: middle;">
              <span style="color: #ffffff; font-weight: 800; font-size: 16px; line-height: 32px; display: inline-block;">S</span>
            </td>
            <td style="padding-left: 12px;">
              <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">ShopMate</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 32px;">
        <h1 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">
          Two-Factor Authentication
        </h1>
        <p style="font-size: 14px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">
          Please use the following 6-digit security code to sign in to your ShopMate Administrator Portal:
        </p>

        <!-- Code Box -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
          <tr>
            <td align="center" style="background-color: #FAF8F5; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px;">
              <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #5C6B4A; display: inline-block; padding-left: 8px;">
                ${otp}
              </span>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 8px 0;">
          ⏱️ This code will expire in <strong>5 minutes</strong>.
        </p>
        <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
          If you did not request this verification code, please ignore this email or review your account security.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: left;">
        <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
          &copy; ${currentYear} ShopMate Inc. Security & Authentication Services.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateOtpText(otp) {
  return `Your ShopMate verification code is: ${otp}\n\nThis code is valid for 5 minutes.\nIf you did not request this code, you can safely ignore this message.\n\nShopMate Team`;
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, otp: customOtp } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    // Extract OTP if passed in html or customOtp
    const otpMatch = html ? html.match(/<strong>(\d{6})<\/strong>/) : null;
    const otp = customOtp || (otpMatch ? otpMatch[1] : null);

    const emailSubject = otp ? `${otp} is your ShopMate verification code` : (subject || 'ShopMate Verification Code');
    const emailHtml = otp ? generateOtpEmailTemplate(otp) : (html || `<p>Your verification code is: <strong>${otp}</strong></p>`);
    const emailText = otp ? generateOtpText(otp) : 'ShopMate Verification Notification';

    // Support both environment variable and secure verified fallback
    const emailUser = process.env.EMAIL_USER || 'attendancesystem786@gmail.com';
    const emailPass = (process.env.EMAIL_PASS || 'jehi luor jmrf bfzq').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // 587 uses STARTTLS
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: `"ShopMate" <${emailUser}>`,
      replyTo: emailUser,
      to,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    console.log(`[Vercel Serverless Email] Message sent: ${info.messageId} to ${to}`);
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('[Vercel Serverless Email Error]:', error);
    return res.status(500).json({
      error: 'Failed to send email: ' + (error.message || String(error))
    });
  }
};

import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Global store for serverless environment in memory cache
global.__shopmate_otp_store = global.__shopmate_otp_store || new Map();

function generateOtpEmailTemplate(otp) {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ShopMate Verification Code</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
    <tr>
      <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; text-align: left;">
        <span style="font-size: 20px; font-weight: 800; color: #5C6B4A;">ShopMate</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h1 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">Sign In Verification</h1>
        <p style="font-size: 14px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">Please use this single-use code to verify your sign in:</p>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
          <tr>
            <td align="center" style="background-color: #FAF8F5; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #5C6B4A;">${otp}</span>
            </td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #64748b;">Valid for 5 minutes. If you did not request this, ignore this email.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${currentYear} ShopMate Inc.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }
    const { email } = body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = crypto.randomInt(100000, 999999).toString();
    global.__shopmate_otp_store.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    const emailUser = process.env.EMAIL_USER || 'attendancesystem786@gmail.com';
    const emailPass = (process.env.EMAIL_PASS || 'jehi luor jmrf bfzq').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"ShopMate" <${emailUser}>`,
      replyTo: emailUser,
      to: email,
      subject: `${otp} is your ShopMate verification code`,
      text: `Your verification code is: ${otp}`,
      html: generateOtpEmailTemplate(otp)
    });

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('send-otp error:', error);
    return res.status(500).json({ error: 'Failed to send OTP: ' + error.message });
  }
}

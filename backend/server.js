const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Reusable Nodemailer transporter for Gmail SMTP (Port 587 STARTTLS)
function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Port 587 uses STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, '') // strip spaces if copied from Google
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// In-memory store for OTPs (email -> { otp, expiresAt })
const otpStore = new Map();

// Professional inbox-optimized HTML email template (clean, modern, zero spam triggers)
function generateOtpEmailTemplate(otp) {
  const currentYear = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShopMate Login Code</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your ShopMate verification code is ${otp}. Valid for 5 minutes.
  </div>

  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <!-- Brand Header -->
    <tr>
      <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; text-align: left;">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 6px; text-align: center; vertical-align: middle;">
              <span style="color: #ffffff; font-weight: 800; font-size: 16px; line-height: 28px; display: inline-block;">S</span>
            </td>
            <td style="padding-left: 10px;">
              <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">ShopMate</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 32px;">
        <h1 style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 12px 0;">
          Your verification code
        </h1>
        <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">
          Please use the following single-use code to sign in to your ShopMate account:
        </p>

        <!-- Code Block -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 24px 0;">
          <tr>
            <td align="center" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 24px;">
              <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f172a; display: inline-block; padding-left: 6px;">
                ${otp}
              </span>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; line-height: 22px; color: #64748b; margin: 0 0 8px 0;">
          This code will expire in <strong>5 minutes</strong>.
        </p>
        <p style="font-size: 13px; line-height: 20px; color: #94a3b8; margin: 0;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: left;">
        <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
          &copy; ${currentYear} ShopMate Inc. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Plain-text alternative for 100% spam deliverability
function generateOtpText(otp) {
  return `Your ShopMate verification code is: ${otp}

This code is valid for 5 minutes.
If you did not request this code, you can safely ignore this message.

ShopMate Team`;
}

// Endpoint to send OTP via email
app.post('/api/email/send', async (req, res) => {
  const { to, subject, html, otp: customOtp } = req.body;
  if (!to) return res.status(400).json({ error: 'Recipient email is required' });

  // Extract OTP from HTML if passed or use provided
  const otpMatch = html ? html.match(/<strong>(\d{6})<\/strong>/) : null;
  const otp = customOtp || (otpMatch ? otpMatch[1] : null);

  const emailSubject = otp ? `${otp} is your ShopMate verification code` : (subject || 'ShopMate Verification Code');
  const emailHtml = otp ? generateOtpEmailTemplate(otp) : (html || `<p>Your verification code is: <strong>${otp}</strong></p>`);
  const emailText = otp ? generateOtpText(otp) : 'ShopMate Notification';

  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[Mock Email] EMAIL_USER / EMAIL_PASS not set in .env. Target: ${to}, OTP: ${otp || 'N/A'}`);
    return res.json({
      success: true,
      simulated: true,
      message: 'EMAIL_USER or EMAIL_PASS not set in .env. Email simulation recorded.'
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"ShopMate" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to,
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });

    console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
    res.json({ message: 'Email sent successfully', messageId: info.messageId, success: true });
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
});

// General OTP send endpoint
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`[Mock Email] OTP for ${email}: ${otp}`);
    return res.json({ message: 'OTP generated (simulation).', success: true });
  }

  try {
    await transporter.sendMail({
      from: `"ShopMate" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to: email,
      subject: `${otp} is your ShopMate verification code`,
      text: generateOtpText(otp),
      html: generateOtpEmailTemplate(otp)
    });
    res.json({ message: 'OTP sent successfully to email.', success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send OTP email: ' + error.message });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const storedData = otpStore.get(email);
  if (!storedData) {
    return res.status(400).json({ error: 'No OTP requested for this email' });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP expired' });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  otpStore.delete(email);
  res.json({ message: 'OTP verified successfully', success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`Nodemailer Gmail SMTP configured with: ${process.env.EMAIL_USER}`);
  } else {
    console.log(`Notice: EMAIL_USER and EMAIL_PASS not yet set in .env. Real email delivery will be enabled as soon as configured.`);
  }
});

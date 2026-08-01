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

// In-memory store for OTPs (For production, use Redis or a database)
const otpStore = new Map(); // email -> { otp, expiresAt }

const emailjs = require('@emailjs/nodejs');

// Send via EmailJS
async function sendEmailJS(toEmail, otp) {
  const serviceId = process.env.EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
  const templateId = process.env.EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
  const privateKey = process.env.EMAILJS_PRIVATE_KEY || ''; // Add private key for REST API

  if (serviceId === 'YOUR_SERVICE_ID') {
    console.warn('EMAILJS keys missing, skipping real email send.');
    return { success: true, message: 'Mock email sent' };
  }

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail,
        passcode: otp
      },
      {
        publicKey: publicKey,
        privateKey: privateKey
      }
    );
    return { success: true };
  } catch (error) {
    throw new Error(`EmailJS Error: ${error.text || error.message || 'Unknown error'}`);
  }
}

app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  
  // Store with 5 min expiry
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  try {
    await sendEmailJS(email, otp);
    res.json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
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

  // Success! In a real app, generate a JWT or Firebase Custom Token here.
  otpStore.delete(email);
  res.json({ message: 'OTP verified successfully', success: true });
});

// Generic email sending route
app.post('/api/email/send', async (req, res) => {
  const { to, subject, html } = req.body;
  if (!to || !html) return res.status(400).json({ error: 'Missing parameters' });

  // Extract OTP from the HTML sent by the frontend Admin Login
  const otpMatch = html.match(/<strong>(\d{6})<\/strong>/);
  const otp = otpMatch ? otpMatch[1] : '123456';

  try {
    await sendEmailJS(to, otp);
    res.json({ message: 'Email sent successfully', success: true });
  } catch (error) {
    console.error('Error sending generic email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

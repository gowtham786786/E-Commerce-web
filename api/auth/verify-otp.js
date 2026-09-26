global.__shopmate_otp_store = global.__shopmate_otp_store || new Map();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  const storedData = global.__shopmate_otp_store.get(email);
  if (!storedData) {
    return res.status(400).json({ error: 'No OTP requested for this email' });
  }

  if (Date.now() > storedData.expiresAt) {
    global.__shopmate_otp_store.delete(email);
    return res.status(400).json({ error: 'OTP expired' });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  global.__shopmate_otp_store.delete(email);
  return res.status(200).json({ success: true, message: 'OTP verified successfully' });
};

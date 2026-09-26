import fs from 'fs';
import path from 'path';

const DEFAULT_STORE_SETTINGS = {
  websiteName: 'ShopMate',
  email: 'reddygowtham397@gmail.com',
  phone: '+91 98765 43210',
  address: '123 Tech Park, Bangalore, India',
  gstNumber: '29AAAAA0000A1Z5',
  taxRate: '18',
  deliveryCharge: '50',
  currency: 'INR',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com'
};

export default async function handler(req, res) {
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

  const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

  if (req.method === 'GET') {
    try {
      if (fs.existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, 'utf8');
        return res.status(200).json({ ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) });
      }
    } catch (e) {
      // fallback
    }
    return res.status(200).json(DEFAULT_STORE_SETTINGS);
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }
      const updated = { ...DEFAULT_STORE_SETTINGS, ...(body || {}) };
      const dir = path.dirname(settingsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2), 'utf8');
      return res.status(200).json({ success: true, settings: updated });
    } catch (err) {
      return res.status(200).json({ success: true, settings: { ...DEFAULT_STORE_SETTINGS, ...req.body } });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

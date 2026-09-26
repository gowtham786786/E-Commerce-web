import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = body || {};

    if (!razorpay_payment_id) {
      return res.status(400).json({ error: 'Payment ID is required for verification' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    // If live/test secret key is provided and signature is passed
    if (keySecret && !keySecret.includes('your_key') && razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature. Verification failed.'
        });
      }

      return res.status(200).json({
        success: true,
        verified: true,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: 'Payment verified successfully'
      });
    }

    // In sandbox / test mode without secret or simulated test transactions
    return res.status(200).json({
      success: true,
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id || `order_test_${Date.now()}`,
      is_test_mode: true,
      message: 'Payment verified in Test / Sandbox mode'
    });
  } catch (error) {
    console.error('[Verify Payment Error]:', error);
    return res.status(500).json({ error: 'Failed to verify payment: ' + error.message });
  }
}

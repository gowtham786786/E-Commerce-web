import { getApiUrl } from './apiConfig';

/**
 * Ensures Razorpay Checkout SDK is loaded dynamically in the browser
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay payment popup and handles verification
 */
export const openRazorpayCheckout = async ({
  amount,
  currency = 'INR',
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  notes = {},
  onSuccess,
  onError,
  onDismiss
}) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay Checkout SDK failed to load. Please check your network connection.');
    }

    // 1. Create order on backend / Vercel serverless function
    const orderRes = await fetch(getApiUrl('/api/payment/create-order'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      throw new Error(orderData.error || 'Failed to initialize payment gateway order');
    }

    // 2. Configure Razorpay modal options
    const options = {
      key: orderData.key_id || 'rzp_test_shopmate',
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'ShopMate',
      description: 'Secure Online Order Payment',
      image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
      order_id: orderData.order_id,
      handler: async function (response) {
        try {
          // 3. Verify signature on backend / Vercel serverless function
          const verifyRes = await fetch(getApiUrl('/api/payment/verify'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || orderData.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Payment verification failed');
          }

          if (onSuccess) {
            onSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || orderData.order_id,
              signature: response.razorpay_signature,
              isTestMode: orderData.is_test_mode || false
            });
          }
        } catch (verifyErr) {
          if (onError) onError(verifyErr);
        }
      },
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone
      },
      notes: {
        platform: 'ShopMate E-Commerce',
        ...notes
      },
      theme: {
        color: '#5C6B4A' // ShopMate luxury brand olive
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
        escape: true,
        backdropclose: false
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (failResponse) {
      if (onError) {
        onError(new Error(failResponse?.error?.description || 'Payment was declined or failed.'));
      }
    });

    rzp.open();
  } catch (err) {
    if (onError) onError(err);
  }
};

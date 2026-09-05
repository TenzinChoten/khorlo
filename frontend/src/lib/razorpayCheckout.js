import { fetchApi } from './api';

function getCheckoutKey(orderKeyId) {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || orderKeyId;
}

function ensureCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay Checkout')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
    document.body.appendChild(script);
  });
}

/**
 * Creates a Razorpay order, opens Standard Checkout, then verifies the payment signature.
 */
export async function startRazorpayCheckout({
  amount,
  currency = 'INR',
  planId,
  name = 'Khorlo',
  description = 'Khorlo payment',
  prefill = {},
}) {
  await ensureCheckoutScript();

  const order = await fetchApi('/create-order', {
    method: 'POST',
    body: JSON.stringify({ amount, currency, planId }),
  });

  const key = getCheckoutKey(order.key_id);
  if (!key) {
    throw new Error('Razorpay key is not configured');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency,
      name,
      description,
      order_id: order.order_id,
      prefill,
      handler: async (response) => {
        try {
          const verification = await fetchApi('/verify-payment', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          resolve(verification);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        // [Reason] Closing the modal is a cancel, not a failed charge
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });

    rzp.on('payment.failed', (response) => {
      const message = response?.error?.description || 'Payment failed';
      reject(new Error(message));
    });

    rzp.open();
  });
}

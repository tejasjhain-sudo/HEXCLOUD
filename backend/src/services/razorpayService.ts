/**
 * Razorpay order creation via REST API (no extra SDK required).
 * Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env for live mode.
 */

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export function isRazorpayConfigured() {
  return Boolean(keyId && keySecret);
}

export async function createRazorpayOrder(amountInr: number, receipt: string) {
  if (!isRazorpayConfigured()) {
    return {
      id: `order_demo_${Date.now()}`,
      amount: Math.round(amountInr * 100),
      currency: 'INR',
      status: 'created',
    };
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amountInr * 100),
      currency: 'INR',
      receipt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay error: ${err}`);
  }

  return res.json();
}

/** Razorpay payment helpers — demo mode when VITE_RAZORPAY_KEY_ID is unset */

export type PaymentProvider = 'RAZORPAY';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
const USD_TO_INR = 83; // display & order conversion

export const isRazorpayConfigured = Boolean(RAZORPAY_KEY);

export interface CheckoutResult {
  provider: PaymentProvider;
  sessionId: string;
  orderId?: string;
  amount: number;
  currency: string;
}

/** Create a Razorpay order (demo when key missing) */
export async function createRazorpayOrder(amountUsd: number): Promise<CheckoutResult> {
  const orderId = `order_${Date.now()}`;
  const amountInr = Math.round(amountUsd * USD_TO_INR * 100); // paise
  if (!isRazorpayConfigured) {
    return {
      provider: 'RAZORPAY',
      sessionId: orderId,
      orderId,
      amount: amountInr / 100,
      currency: 'inr',
    };
  }
  return {
    provider: 'RAZORPAY',
    sessionId: orderId,
    orderId,
    amount: amountInr / 100,
    currency: 'inr',
  };
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  orderId: string,
  amount: number,
  email: string,
  onSuccess: (paymentId: string) => void
): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !isRazorpayConfigured) {
    onSuccess(`pay_demo_${orderId}`);
    return;
  }
  const Razorpay = (window as unknown as { Razorpay: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay;
  const rzp = new Razorpay({
    key: RAZORPAY_KEY,
    amount: Math.round(amount * 100),
    currency: 'INR',
    name: 'HEXCloud',
    description: 'HEXCloud subscription',
    order_id: orderId,
    prefill: { email },
    handler: (response: { razorpay_payment_id: string }) => {
      onSuccess(response.razorpay_payment_id);
    },
  });
  rzp.open();
}

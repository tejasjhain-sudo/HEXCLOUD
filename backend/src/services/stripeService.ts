import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2024-04-10' }) : null;

export async function createStripeCheckoutSession(
  amountUsd: number,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    return {
      id: `cs_demo_${Date.now()}`,
      url: `${successUrl}?session_id=cs_demo&amount=${amountUsd}`,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'HEXCloud Wallet Credits' },
          unit_amount: Math.round(amountUsd * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { userId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { id: session.id, url: session.url };
}

export function constructStripeWebhookEvent(payload: Buffer, signature: string) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

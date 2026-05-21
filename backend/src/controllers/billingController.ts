import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { db } from '../services/supabaseData';
import { logger } from '../utils/logger';
import { createStripeCheckoutSession } from '../services/stripeService';
import { createRazorpayOrder } from '../services/razorpayService';
import { supabaseAdmin } from '../config/supabase';

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { amount } = z.object({ amount: z.number().min(5).max(500) }).parse(req.body);
    const mockSessionId = `cs_test_${Math.random().toString(36).slice(2, 14)}`;
    const mockCheckoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?session_id=${mockSessionId}&amount=${amount}`;
    res.json({ sessionId: mockSessionId, url: mockCheckoutUrl });
  } catch (err) {
    next(err);
  }
};

export const completeCheckoutMock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { sessionId, amount } = z
      .object({ sessionId: z.string(), amount: z.number().positive() })
      .parse(req.body);
    await db.creditUserWallet(userId, amount, `Deposited credits via Stripe (Session: ${sessionId})`);
    await logger.info(`User ${userId} credited ₹${amount} via checkout`, 'BILLING');
    res.json({ message: 'Credits successfully loaded to your wallet' });
  } catch (err) {
    next(err);
  }
};

export const changePlan = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { planType } = z.object({ planType: z.enum(['FREE', 'BASIC', 'PRO']) }).parse(req.body);
    const user = await db.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.plan_type === planType) {
      return res.status(400).json({ error: `You are already on the ${planType} plan` });
    }
    let cost = 0;
    if (planType === 'BASIC') cost = 10;
    if (planType === 'PRO') cost = 25;
    if (cost > 0 && Number(user.wallet_balance) < cost) {
      return res.status(400).json({
        error: `Insufficient credits. You need ₹${cost} to switch to ${planType}. Balance: ₹${Number(user.wallet_balance)}.`,
      });
    }
    if (cost > 0) {
      await db.debitUserWallet(userId, cost, `Plan upgrade to ${planType}`);
    }
    await db.updateUserPlan(userId, planType);
    await logger.info(`User ${userId} changed plan to ${planType}`, 'BILLING');
    res.json({ message: `Successfully updated plan to ${planType}` });
  } catch (err) {
    next(err);
  }
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const rows = await db.listTransactions(userId);
    res.json(
      rows.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        createdAt: t.created_at,
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const getInvoices = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const rows = await db.listInvoices(userId);
    res.json(
      rows.map((i) => ({
        id: i.id,
        amount: Number(i.amount),
        status: i.status,
        provider: i.provider,
        invoiceNumber: i.invoice_number,
        createdAt: i.created_at,
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const getBillingSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [transactions, invoices, subRes, usageRes, pmRes] = await Promise.all([
      db.listTransactions(userId),
      db.listInvoices(userId),
      supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).eq('status', 'ACTIVE').maybeSingle(),
      supabaseAdmin.from('usage_records').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabaseAdmin.from('payment_methods').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    res.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        description: t.description,
        createdAt: t.created_at,
      })),
      invoices: invoices.map((i) => ({
        id: i.id,
        amount: Number(i.amount),
        status: i.status,
        provider: i.provider,
        invoiceNumber: i.invoice_number,
        createdAt: i.created_at,
      })),
      subscription: subRes.data
        ? {
            id: subRes.data.id,
            planType: subRes.data.plan_type,
            status: subRes.data.status,
            billingCycle: subRes.data.billing_cycle,
            amount: Number(subRes.data.amount),
            provider: subRes.data.provider,
            currentPeriodStart: subRes.data.current_period_start,
            currentPeriodEnd: subRes.data.current_period_end,
          }
        : null,
      usageRecords: (usageRes.data ?? []).map((u) => ({
        id: u.id,
        resourceType: u.resource_type,
        resourceLabel: u.resource_label,
        quantity: Number(u.quantity),
        unit: u.unit,
        cost: Number(u.cost),
        periodStart: u.period_start,
        periodEnd: u.period_end,
        createdAt: u.created_at,
      })),
      paymentMethods: (pmRes.data ?? []).map((p) => ({
        id: p.id,
        provider: p.provider,
        brand: p.brand,
        last4: p.last4,
        expMonth: p.exp_month,
        expYear: p.exp_year,
        isDefault: p.is_default,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const createStripeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { amount } = z.object({ amount: z.number().min(5).max(500) }).parse(req.body);
    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    const session = await createStripeCheckoutSession(
      amount,
      userId,
      `${base}/billing?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
      `${base}/billing`,
    );
    res.json({ sessionId: session.id, url: session.url, provider: 'STRIPE' });
  } catch (err) {
    next(err);
  }
};

export const createRazorpayOrderHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { amount } = z.object({ amount: z.number().min(5).max(500) }).parse(req.body);
    const amountInr = amount * 83;
    const order = (await createRazorpayOrder(amountInr, `wallet_${userId}_${Date.now()}`)) as {
      id: string;
      amount: number;
      currency: string;
    };
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, provider: 'RAZORPAY' });
  } catch (err) {
    next(err);
  }
};

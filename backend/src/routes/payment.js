const express = require('express');
const router = express.Router();
const crypto = require('crypto');

let Razorpay = null, razorpay = null;
try {
  Razorpay = require('razorpay');
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  }
} catch (e) { console.log('Razorpay not configured'); }

const PLANS = {
  premium_monthly: { amount: 9900, currency: 'INR', name: 'Premium Monthly' },
  premium_lifetime: { amount: 10000, currency: 'INR', name: 'Premium Lifetime' }
};

router.post('/create-order', async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    if (!razorpay) {
      return res.json({
        success: true, demo: true,
        orderId: 'demo_' + Date.now(),
        amount: plan.amount, currency: plan.currency,
        planName: plan.name, keyId: 'rzp_test_demo',
        upiId: 'princeverma8753-1@oksbi'
      });
    }

    const order = await razorpay.orders.create({
      amount: plan.amount, currency: plan.currency,
      receipt: `receipt_${Date.now()}`,
      notes: { planId, planName: plan.name }
    });

    res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, planName: plan.name, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(500).json({ error: 'Order creation failed', message: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.json({ success: true, demo: true, planToken: 'demo_token_' + Date.now() });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (expectedSign !== razorpay_signature) return res.status(400).json({ error: 'Invalid signature' });

    const planToken = Buffer.from(JSON.stringify({
      planId, paymentId: razorpay_payment_id, timestamp: Date.now(),
      expires: planId === 'premium_lifetime' ? null : Date.now() + 30 * 24 * 60 * 60 * 1000
    })).toString('base64');

    res.json({ success: true, planToken });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
});

router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: [
      { id: 'free', name: 'Free', price: 0, period: 'forever', features: ['5 AI generations/day', 'Max 5000 words', 'Basic conversion', 'Ads enabled'] },
      { id: 'premium_monthly', name: 'Premium', price: 99, period: 'month', priceInPaise: 9900, badge: 'Most Popular' },
      { id: 'premium_lifetime', name: 'Lifetime', price: 100, period: 'one-time', priceInPaise: 10000, badge: 'Best Value' }
    ]
  });
});

router.get('/upi-info', (req, res) => {
  res.json({
    success: true,
    upiId: 'princeverma8753-1@oksbi',
    name: 'Prince Verma',
    note: 'After payment, send screenshot to princeverma50055@gmail.com'
  });
});

module.exports = router;

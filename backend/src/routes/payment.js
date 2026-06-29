const express = require('express');
const router = express.Router();

const UPI_ID = 'princeverma8753-1@oksbi';
const NAME = 'Prince Verma';
const EMAIL = 'princeverma50055@gmail.com';

const PLANS = {
  premium_monthly: { amount: 99, name: 'Premium Monthly', period: '1 Month' },
  premium_lifetime: { amount: 100, name: 'Premium Lifetime', period: 'Lifetime' }
};

// Get plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    upiId: UPI_ID,
    plans: [
      {
        id: 'free', name: 'Free', price: 0, period: 'forever',
        features: ['5 AI generations/day', 'Max 5000 words', 'Basic conversion', 'Ads enabled']
      },
      {
        id: 'premium_monthly', name: 'Premium', price: 99, period: 'month',
        features: ['Unlimited AI generations', 'No ads', 'All tools', 'Priority processing'],
        badge: 'Most Popular'
      },
      {
        id: 'premium_lifetime', name: 'Lifetime', price: 100, period: 'one-time',
        features: ['Lifetime access', 'All future features', 'No ads ever', 'Unlimited everything'],
        badge: 'Best Value'
      }
    ]
  });
});

// UPI payment info
router.get('/upi-info', (req, res) => {
  res.json({ success: true, upiId: UPI_ID, name: NAME, email: EMAIL });
});

// After user pays manually, they submit their transaction ID
router.post('/submit-payment', (req, res) => {
  const { planId, transactionId, userEmail, userName } = req.body;
  if (!planId || !transactionId) {
    return res.status(400).json({ error: 'planId and transactionId required' });
  }

  const plan = PLANS[planId];
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });

  // Log for manual verification (in production save to MongoDB)
  console.log('💰 New Payment Submission:', {
    plan: plan.name, amount: `₹${plan.amount}`,
    transactionId, userEmail, userName,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Payment submission received! We will verify your transaction ID "${transactionId}" and activate your ${plan.name} plan within 24 hours. Check your email.`,
    plan: plan.name,
    amount: plan.amount,
    verificationEmail: EMAIL
  });
});

module.exports = router;

const rateLimit = require('express-rate-limit');

const ipUsage = new Map();
const FREE_DAILY_LIMIT = parseInt(process.env.FREE_DAILY_LIMIT) || 5;

setInterval(() => ipUsage.clear(), 24 * 60 * 60 * 1000);

function checkFreePlanLimit(req, res, next) {
  const planToken = req.headers['x-plan-token'];
  if (planToken) {
    req.isPremium = true;
    req.maxWords = 999999;
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const key = `${ip}_${new Date().toDateString()}`;
  const usage = ipUsage.get(key) || 0;

  if (usage >= FREE_DAILY_LIMIT) {
    return res.status(429).json({
      error: 'Daily limit reached',
      message: `Free plan: ${FREE_DAILY_LIMIT} generations/day. Upgrade to Premium for unlimited.`,
      limit: FREE_DAILY_LIMIT,
      used: usage,
      upgrade: true
    });
  }

  ipUsage.set(key, usage + 1);
  req.isPremium = false;
  req.maxWords = 5000;
  req.remainingGenerations = FREE_DAILY_LIMIT - usage - 1;
  next();
}

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

module.exports = { checkFreePlanLimit, apiRateLimit };

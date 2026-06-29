const express = require('express');
const router = express.Router();

let stats = { totalGenerations: 15847, totalConversions: 8234, activeUsers: 1205, wordsGenerated: 47820000 };

router.get('/stats', (req, res) => {
  stats.totalGenerations += Math.floor(Math.random() * 3);
  stats.totalConversions += Math.floor(Math.random() * 2);
  res.json({ success: true, stats });
});

router.post('/track', (req, res) => {
  stats.totalGenerations++;
  res.json({ success: true });
});

module.exports = router;

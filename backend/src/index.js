require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes - safe import
let aiRoutes, converterRoutes, pdfRoutes, ocrRoutes, paymentRoutes, analyticsRoutes;

try { aiRoutes = require('./routes/ai'); } catch(e) { console.log('ai routes error:', e.message); }
try { converterRoutes = require('./routes/converter'); } catch(e) { console.log('converter error:', e.message); }
try { pdfRoutes = require('./routes/pdf'); } catch(e) { console.log('pdf error:', e.message); }
try { ocrRoutes = require('./routes/ocr'); } catch(e) { console.log('ocr error:', e.message); }
try { paymentRoutes = require('./routes/payment'); } catch(e) { console.log('payment error:', e.message); }
try { analyticsRoutes = require('./routes/analytics'); } catch(e) { console.log('analytics error:', e.message); }

if (aiRoutes) app.use('/api/ai', aiRoutes);
if (converterRoutes) app.use('/api/convert', converterRoutes);
if (pdfRoutes) app.use('/api/pdf', pdfRoutes);
if (ocrRoutes) app.use('/api/ocr', ocrRoutes);
if (paymentRoutes) app.use('/api/payment', paymentRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ProjectX AI Studio API running' });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 ProjectX AI Studio Backend running on port ${PORT}`);
});

module.exports = app;

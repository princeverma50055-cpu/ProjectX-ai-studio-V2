require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');

const aiRoutes = require('./routes/ai');
const converterRoutes = require('./routes/converter');
const pdfRoutes = require('./routes/pdf');
const ocrRoutes = require('./routes/ocr');
const paymentRoutes = require('./routes/payment');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projectx-ai-studio')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('⚠️  MongoDB not connected:', err.message));

app.use('/api/ai', aiRoutes);
app.use('/api/convert', converterRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ProjectX AI Studio API running', version: '1.0.0' });
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

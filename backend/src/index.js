require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Allow all origins (testing)
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
try {
  app.use('/api/ai', require('./routes/ai'));
  console.log('✅ AI routes loaded');
} catch (err) {
  console.error('❌ AI route error:', err.message);
}

try {
  app.use('/api/convert', require('./routes/converter'));
} catch (err) {}

try {
  app.use('/api/pdf', require('./routes/pdf'));
} catch (err) {}

try {
  app.use('/api/ocr', require('./routes/ocr'));
} catch (err) {}

try {
  app.use('/api/payment', require('./routes/payment'));
} catch (err) {}

try {
  app.use('/api/analytics', require('./routes/analytics'));
} catch (err) {}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectX AI Studio API running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectX AI Studio API running',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;

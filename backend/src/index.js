require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(cors({
  origin: 'https://project-x-ai-studio-v2.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Kyunki index.js src/ mein hai, hum './routes/' use karenge
const routePaths = [
  { path: '/api/ai', file: './routes/ai' },
  { path: '/api/convert', file: './routes/converter' },
  { path: '/api/pdf', file: './routes/pdf' },
  { path: '/api/ocr', file: './routes/ocr' },
  { path: '/api/payment', file: './routes/payment' },
  { path: '/api/analytics', file: './routes/analytics' }
];

routePaths.forEach(r => {
  try {
    const routeModule = require(r.file);
    app.use(r.path, routeModule);
  } catch (e) {
    console.log(`Error loading ${r.file}:`, e.message);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ProjectX AI Studio API running' });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;

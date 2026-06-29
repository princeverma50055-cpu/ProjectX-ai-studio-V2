const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({ dest: uploadsDir, limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/image-to-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { language = 'eng' } = req.body;
    const { data: { text, confidence } } = await Tesseract.recognize(req.file.path, language);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, text: text.trim(), confidence: Math.round(confidence), wordCount: text.trim().split(/\s+/).length, language });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'OCR failed', message: error.message });
  }
});

router.get('/languages', (req, res) => {
  res.json({ success: true, languages: [
    { code: 'eng', name: 'English' }, { code: 'hin', name: 'Hindi' },
    { code: 'fra', name: 'French' }, { code: 'deu', name: 'German' },
    { code: 'spa', name: 'Spanish' }, { code: 'por', name: 'Portuguese' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' }, { code: 'jpn', name: 'Japanese' },
    { code: 'kor', name: 'Korean' }, { code: 'ara', name: 'Arabic' },
    { code: 'rus', name: 'Russian' }, { code: 'ita', name: 'Italian' },
  ]});
});

module.exports = router;

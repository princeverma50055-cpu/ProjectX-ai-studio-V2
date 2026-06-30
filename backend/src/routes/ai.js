const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

async function generateWithFallback(prompt) {
    let lastError = null;
    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (err) {
            console.log(`Model ${modelName} failed:`, err.message);
            lastError = err;
        }
    }
    throw lastError || new Error('All Gemini models failed');
}

// 1. Generate Content Route
router.post('/generate', async (req, res) => {
    try {
        const { toolType, input } = req.body;

        const prompt = `Act as an expert for ${toolType}. Create content for: ${input}`;
        const text = await generateWithFallback(prompt);

        res.json({ success: true, result: text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "AI generation failed", error: error.message });
    }
});

// 2. AI Chat Route
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        const prompt = `You are a helpful AI assistant. Respond to: ${message}`;
        const text = await generateWithFallback(prompt);

        res.json({ success: true, response: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Chat failed', error: error.message });
    }
});

module.exports = router;

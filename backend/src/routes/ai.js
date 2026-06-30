const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Ensure you have this package

// AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Generate Content Route
router.post('/generate', async (req, res) => {
    try {
        const { toolType, input } = req.body;
        
        // AI Model initialization
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Act as an expert for ${toolType}. Create content for: ${input}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Ye 'result' key frontend ko bhej rahe hain, jo humne frontend mein set ki hai
        res.json({ success: true, result: text });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "AI generation failed" });
    }
});

// ... baaki routes same rahenge
module.exports = router;

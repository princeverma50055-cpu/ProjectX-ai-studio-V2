const express = require('express');
const router = express.Router();
const { generateAIContent } = require('../services/aiService');
const { checkFreePlanLimit, apiRateLimit } = require('../middleware/rateLimiter');

router.use(apiRateLimit);

router.post('/generate', checkFreePlanLimit, async (req, res) => {
  try {
    const { toolType, input } = req.body;
    if (!toolType || !input) return res.status(400).json({ error: 'toolType and input are required' });
    if (input.trim().length < 3) return res.status(400).json({ error: 'Input too short' });

    const result = await generateAIContent(toolType, input, req.maxWords || 5000);
    res.json({
      success: true,
      result,
      toolType,
      wordCount: result.split(/\s+/).length,
      remainingGenerations: req.remainingGenerations ?? null,
      isPremium: req.isPremium || false
    });
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed', message: error.message });
  }
});

router.post('/chat', checkFreePlanLimit, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const result = await generateAIContent('ai_chat', message, req.maxWords || 5000);
    res.json({ success: true, response: result, remainingGenerations: req.remainingGenerations ?? null });
  } catch (error) {
    res.status(500).json({ error: 'Chat failed', message: error.message });
  }
});

router.get('/tools', (req, res) => {
  const tools = [
    { id: 'blog_writer', name: 'Blog Writer', category: 'writing', icon: '📝' },
    { id: 'seo_article', name: 'SEO Article', category: 'writing', icon: '🔍' },
    { id: 'essay', name: 'Essay Writer', category: 'writing', icon: '📄' },
    { id: 'story', name: 'Story Writer', category: 'writing', icon: '📖' },
    { id: 'youtube_script', name: 'YouTube Script', category: 'writing', icon: '🎬' },
    { id: 'email_writer', name: 'Email Writer', category: 'writing', icon: '✉️' },
    { id: 'resume_writer', name: 'Resume Writer', category: 'writing', icon: '👔' },
    { id: 'cover_letter', name: 'Cover Letter', category: 'writing', icon: '📋' },
    { id: 'product_description', name: 'Product Description', category: 'writing', icon: '🛍️' },
    { id: 'social_media_caption', name: 'Social Media Caption', category: 'writing', icon: '📱' },
    { id: 'rewrite_content', name: 'Rewrite Content', category: 'tools', icon: '🔄' },
    { id: 'grammar_checker', name: 'Grammar Checker', category: 'tools', icon: '✅' },
    { id: 'summarizer', name: 'Summarizer', category: 'tools', icon: '📌' },
    { id: 'translator', name: 'Translator', category: 'tools', icon: '🌐' },
    { id: 'humanize_ai', name: 'Humanize AI Text', category: 'tools', icon: '🧠' },
    { id: 'code_generator', name: 'Code Generator', category: 'extra', icon: '💻' },
    { id: 'image_prompt', name: 'Image Prompt Generator', category: 'extra', icon: '🎨' },
    { id: 'title_generator', name: 'Title Generator', category: 'extra', icon: '🏷️' },
    { id: 'keyword_generator', name: 'Keyword Generator', category: 'extra', icon: '🔑' },
    { id: 'meta_description', name: 'Meta Description', category: 'extra', icon: '🏷️' },
    { id: 'faq_generator', name: 'FAQ Generator', category: 'extra', icon: '❓' },
  ];
  res.json({ success: true, tools });
});

module.exports = router;

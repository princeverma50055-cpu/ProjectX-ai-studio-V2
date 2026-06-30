const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

let openai = null;
let gemini = null;

if (process.env.OPENAI_API_KEY) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (process.env.GEMINI_API_KEY) gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AI_PROMPTS = {
  blog_writer: (i) => `Write a comprehensive, engaging blog post about: "${i}". Include SEO title, intro, H2/H3 sections, conclusion. 1500-2000 words.`,
  seo_article: (i) => `Write a fully SEO-optimized article about: "${i}". Include meta title, meta description, H1/H2/H3 structure, FAQs, conclusion. 2000+ words.`,
  essay: (i) => `Write a well-structured academic essay about: "${i}". Include thesis, intro, body paragraphs, counterarguments, conclusion.`,
  story: (i) => `Write a creative engaging short story based on: "${i}". Include characters, dialogue, climax, resolution.`,
  youtube_script: (i) => `Write a full YouTube script about: "${i}". Include hook, intro, main sections with timestamps, CTA, outro.`,
  email_writer: (i) => `Write a professional email for: "${i}". Include subject line, greeting, body, CTA, sign-off.`,
  resume_writer: (i) => `Create a professional resume for: "${i}". Include summary, experience with bullet points, education, skills.`,
  cover_letter: (i) => `Write a compelling cover letter for: "${i}". Opening hook, relevant experience, value proposition, closing CTA. Under 400 words.`,
  product_description: (i) => `Write a persuasive product description for: "${i}". Include headline, features, benefits, USP, CTA.`,
  social_media_caption: (i) => `Write 5 social media captions for: "${i}". Versions for Instagram, Twitter, LinkedIn, Facebook, TikTok. Include emojis and hashtags.`,
  rewrite_content: (i) => `Rewrite the following content to be more engaging and clear while preserving meaning: "${i}"`,
  grammar_checker: (i) => `Check and correct all grammar, spelling, punctuation errors in: "${i}". Show corrected version and list all changes.`,
  summarizer: (i) => `Summarize in 3 formats: 1) One-sentence, 2) 100-word paragraph, 3) 5-7 bullet points: "${i}"`,
  translator: (i) => `Translate accurately preserving tone and context: "${i}". If no language specified, translate to English.`,
  humanize_ai: (i) => `Rewrite this AI-generated text to sound completely natural and human. Remove robotic patterns: "${i}"`,
  ai_chat: (i) => `You are a helpful AI assistant for ProjectX AI Studio. Respond to: "${i}"`,
  code_generator: (i) => `Generate clean, well-commented production-ready code for: "${i}". Include language spec, complete code, comments, usage example.`,
  image_prompt: (i) => `Generate 5 detailed AI image prompts for: "${i}". Include style, lighting, color, mood, camera angle, technical details.`,
  title_generator: (i) => `Generate 10 compelling SEO titles for: "${i}". Mix how-to, list, question, power word titles. Rate each 1-10.`,
  keyword_generator: (i) => `Generate keyword list for: "${i}". Include 5 primary, 10 secondary, 15 long-tail, 5 LSI keywords with search intent.`,
  meta_description: (i) => `Write 5 meta descriptions for: "${i}". Each under 160 chars, keyword-rich, with CTA. Rate for CTR.`,
  faq_generator: (i) => `Generate 10 FAQs with detailed answers for: "${i}". Basic to advanced. Include schema markup at end.`
};

async function generateWithGemini(prompt, maxWords) {
  const model = gemini.getGenerativeModel({
    model: "gemini-2.0-flash"
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${prompt}\n\nKeep the response under ${maxWords} words.`
          }
        ]
      }
    ]
  });

  return result.response.text();
}

async function generateWithOpenAI(prompt, maxWords) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: `You are an expert AI writing assistant. Keep responses under ${maxWords} words.` },
      { role: 'user', content: prompt }
    ],
    max_tokens: Math.min(maxWords * 2, 4000),
    temperature: 0.7
  });
  return completion.choices[0].message.content;
}

async function generateAIContent(toolType, userInput, maxWords = 5000) {
  const promptFn = AI_PROMPTS[toolType];
  if (!promptFn) throw new Error(`Unknown tool type: ${toolType}`);
  const prompt = promptFn(userInput);

  if (gemini) {
    try { return await generateWithGemini(prompt, maxWords); }
    catch (err) { console.log('Gemini failed, trying OpenAI:', err.message); }
  }
  if (openai) return await generateWithOpenAI(prompt, maxWords);

  return `[DEMO MODE] Add GEMINI_API_KEY or OPENAI_API_KEY in .env to enable AI.\n\nYour request: "${userInput}"\nTool: ${toolType}`;
}

module.exports = { generateAIContent, AI_PROMPTS };

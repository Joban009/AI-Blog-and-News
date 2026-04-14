import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
function getGenAI() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

// POST /api/ai/generate
export async function generateContent(req, res, next) {
  try {
    const { prompt, type = 'blog', tone = 'professional', length = 'medium' } = req.body;

    if (!process.env.GEMINI_API_KEY)
      return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });

    const wordCount = length === 'short' ? 300 : length === 'long' ? 1200 : 600;

    const systemPrompt = `You are an expert ${type} writer. 
Write a complete ${type} post in a ${tone} tone.
The post must be approximately ${wordCount} words.
Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "title": "...",
  "excerpt": "...",
  "content": "... (HTML formatted with <h2>, <p>, <ul> tags)"
}`;

    const model = getGenAI().getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(`${systemPrompt}\n\nTopic: ${prompt}`);
    const raw = result.response.text().trim();

    let generated;
    try {
      // Attempt to parse the raw response
      generated = JSON.parse(raw);
    } catch (parseErr) {
      // Fallback: search for a JSON-like structure if parsing fails
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          generated = JSON.parse(jsonMatch[0]);
        } catch (innerErr) {
          throw new Error('AI returned malformed JSON structure.');
        }
      } else {
        throw new Error('AI failed to return a JSON response.');
      }
    }

    res.json({ generated, prompt });
  } catch (err) {
    console.error('AI Generation Error:', err);
    if (err.message?.includes('JSON') || err.message?.includes('malformed'))
      return res.status(502).json({ error: 'AI returned a malformed response. Please try again with a different prompt.' });
    
    // Check for specific API errors
    if (err.message?.includes('API_KEY_INVALID'))
      return res.status(401).json({ error: 'Invalid Gemini API Key. Please check your .env file.' });

    next(err);
  }
}

// POST /api/ai/improve
export async function improveContent(req, res, next) {
  try {
    const { content, instruction } = req.body;

    if (!process.env.GEMINI_API_KEY)
      return res.status(503).json({ error: 'AI service not configured.' });

    const model = getGenAI().getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });

    const prompt = `You are an expert editor. ${instruction || 'Improve the following content for clarity, engagement, and professionalism.'}
Return ONLY the improved HTML content, no extra commentary.

Content:
${content}`;

    const result = await model.generateContent(prompt);
    const improved = result.response.text().trim();

    res.json({ improved });
  } catch (err) { next(err); }
}

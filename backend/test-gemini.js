import './load-env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini() {
  console.log('Checking environment variables...');
  console.log('PORT:', process.env.PORT);
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present (Hidden)' : 'MISSING');
  console.log('GEMINI_MODEL:', process.env.GEMINI_MODEL);

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not set in process.env');
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    console.log(`Using model: "${modelName}"`);
    /*
    // Listing models might fail without specific permissions, but let's try
    try {
        const models = await genAI.listModels();
        console.log('Available models:', models);
    } catch (e) {
        console.log('Could not list models (normal for some keys)');
    }
    */

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" // Try literal
    });
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini Response:', text);
    const parsed = JSON.parse(text);
    if (parsed.status === 'success') {
      console.log('✅ Test Passed: Gemini API returned valid JSON and environment variables are loaded.');
    } else {
      console.error('❌ Test Failed: Response status was not "success"');
    }
  } catch (error) {
    console.error('❌ Test Failed with Error:');
    console.error(error);
    if (error.message?.includes('API_KEY_INVALID')) {
        console.error('Tip: The API key provided seems invalid.');
    }
  }
}

testGemini();

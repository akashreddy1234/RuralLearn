const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fs = require('fs');
async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    fs.writeFileSync('models.json', JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch (e) {
    console.error(e);
  }
}
listModels();

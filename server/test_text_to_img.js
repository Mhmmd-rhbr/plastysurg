import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test(modelName) {
  try {
    const payload = {
      model: modelName,
      messages: [{
        role: 'user',
        content: 'Edit the uploaded image of a face and make the nose smaller. Give me the resulting image.'
      }]
    };

    console.log(`Testing ${modelName} with text payload...`);
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log(`Success ${modelName}!`, res.data.choices[0].message.content);
  } catch (e) {
    console.error(`Error ${modelName}:`, e?.response?.data || e.message);
  }
}

test('google/gemini-3.1-flash-image-preview');
test('gpt-5-nano');

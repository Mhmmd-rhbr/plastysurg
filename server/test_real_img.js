import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test(modelName) {
  try {
    const payload = {
      model: modelName,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'این چیه؟' },
          { type: 'image_url', image_url: { url: 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&w=600&h=800' } }
        ]
      }]
    };

    console.log(`Testing ${modelName} with array payload...`);
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log(`Success ${modelName}!`, res.data.choices[0].message.content);
  } catch (e) {
    console.error(`Error ${modelName}:`, e?.response?.data || e.message);
  }
}

test('google/gemini-3.1-flash-image-preview');

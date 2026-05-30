import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const payload = {
      model: 'openai/gpt-5.4-image-2',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Edit this photo: make the nose smaller, but KEEP the exact same person.' },
          { type: 'image_url', image_url: { url: 'https://citygpt.ir/uploads/e457f975-f76e-4402-9988-8cd3bf0b299c.png' } } // A dummy URL format assuming citygpt uploaded it
        ]
      }]
    };

    console.log('Testing array payload with gpt-5.4-image-2...');
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log('Success!', res.data.length);
  } catch (e) {
    console.error('Error:', e?.response?.data || e.message);
  }
}
test();

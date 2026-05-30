import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const payload = {
      model: 'openai/gpt-5.4-image-2',
      prompt: 'A red apple',
      n: 1,
      size: '1024x1024'
    };

    console.log('Testing /v1/images/generations...');
    const res = await axios.post('https://citygpt.ir/api/v1/images/generations', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log('Success!', res.data);
  } catch (e) {
    console.error('Error:', e?.response?.data || e.message);
  }
}
test();

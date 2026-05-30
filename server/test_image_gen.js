import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test(modelName) {
  try {
    const payload = {
      model: modelName,
      prompt: 'A highly realistic photo of a woman after rhinoplasty surgery.',
      n: 1,
      size: '1024x1024'
    };

    console.log(`Testing ${modelName} with /v1/images/generations...`);
    const res = await axios.post('https://citygpt.ir/api/v1/images/generations', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log(`Success ${modelName}!`, res.data.data[0].url);
  } catch (e) {
    console.error(`Error ${modelName}:`, e?.response?.data || e.message);
  }
}

async function run() {
  await test('gpt-5-nano');
  await test('google/gemini-3.1-flash-image-preview');
}
run();

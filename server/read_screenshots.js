import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const apiKey = process.env.CITYGPT_API_KEY;

async function analyzeImage(filename) {
  const fullPath = path.join('/Users/mamad/.gemini/antigravity/brain/2a5bf2e5-a502-41c4-8f62-4f6faecb641d', filename);
  if (!fs.existsSync(fullPath)) return console.log(filename, 'not found');
  
  const form = new FormData();
  form.append('file', fs.createReadStream(fullPath));
  const uploadRes = await axios.post('https://citygpt.ir/api/v1/files', form, {
    headers: { ...form.getHeaders(), 'Authorization': `Bearer ${apiKey}` }
  });
  const url = `https://citygpt.ir${uploadRes.data.url}`;
  
  const payload = {
    model: 'google/gemini-3.1-flash-image-preview',
    messages: [{
      role: 'user',
      content: `Please read all text in this screenshot and summarize any API instructions or code examples it contains. URL: ${url}`
    }]
  };
  
  const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
  });
  console.log(`\n--- ${filename} ---`);
  console.log(res.data.choices[0].message.content);
}

async function run() {
  const files = [
    'media__1780153024156.png',
    'media__1780153024187.png',
    'media__1780153024189.png',
    'media__1780153024193.png',
    'media__1780153024194.png'
  ];
  for (const f of files) {
    await analyzeImage(f);
  }
}
run();

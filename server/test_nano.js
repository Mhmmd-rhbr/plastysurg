import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAHklEQVRo3u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAA4G0mAAABC1B9WQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('dummy3.png', dummyPng);
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy3.png'));
    const uploadRes = await axios.post('https://citygpt.ir/api/v1/files', form, {
      headers: { ...form.getHeaders(), 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    const url = `https://citygpt.ir${uploadRes.data.url}`;

    const prompt = `IMPORTANT: You are given a real photo of a male/man patient, 30 years old. 
Edit THIS EXACT photo to show realistic post-rhinoplasty results. 
Output the edited photo maintaining photographic quality and realism. You MUST return the edited image as a URL or base64 data.

Image URL: ${url}`;

    const payload = {
      model: 'google/gemini-3.1-flash-image-preview',
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    console.log(`Testing google/gemini-3.1-flash-image-preview with string payload...`);
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log(`Response Data:`, res.data);
  } catch (e) {
    console.error(`Error:`, e?.response?.data || e.message);
  }
}

test();

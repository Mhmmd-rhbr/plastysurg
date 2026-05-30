import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAHklEQVRo3u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAA4G0mAAABC1B9WQAAAABJRU5ErkJggg==', 'base64');
    const base64Data = `data:image/png;base64,${dummyPng.toString('base64')}`;
    
    const payload = {
      model: 'google/gemini-3.1-flash-image-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Generate an edited version of this image.' },
          { type: 'image_url', image_url: { url: base64Data } }
        ]
      }]
    };

    console.log(`Testing base64...`);
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log(`Success! Response:`, res.data.choices[0].message.content);
  } catch (e) {
    console.error(`Error:`, e?.response?.data || e.message);
  }
}

test();

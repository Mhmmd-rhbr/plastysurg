import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAHklEQVRo3u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAA4G0mAAABC1B9WQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('dummy2.png', dummyPng);
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy2.png'));
    const uploadRes = await axios.post('https://citygpt.ir/api/v1/files', form, {
      headers: { ...form.getHeaders(), 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    const url = `https://citygpt.ir${uploadRes.data.url}`;

    const payload = {
      model: 'openai/gpt-5.4-image-2',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Edit this image.' },
          { type: 'image_url', image_url: { url: url } }
        ]
      }]
    };

    console.log(`Testing openai/gpt-5.4-image-2 with array payload...`);
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log(`Success! Response length:`, res.data.choices?.[0]?.message?.content?.length);
  } catch (e) {
    console.error(`Error:`, e?.response?.data || e.message);
  }
}

test();

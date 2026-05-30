import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAHklEQVRo3u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAA4G0mAAABC1B9WQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('dummy6.png', dummyPng);
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy6.png'));
    const uploadRes = await axios.post('https://citygpt.ir/api/v1/files', form, {
      headers: { ...form.getHeaders(), 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    const url = `https://citygpt.ir${uploadRes.data.url}`;

    const payload = {
      model: 'gpt-5-nano',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'What color is this image?' },
          { type: 'image_url', image_url: { url: url } }
        ]
      }]
    };

    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log(`Array Payload Success for gpt-5-nano!`);
    console.log(res.data.choices?.[0]?.message?.content);
  } catch (e) {
    console.error(`Error with gpt-5-nano:`, e?.response?.data || e.message);
  }
}

test();

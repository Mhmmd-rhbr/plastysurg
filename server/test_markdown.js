import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAHklEQVRo3u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAA4G0mAAABC1B9WQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('dummy.png', dummyPng);
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy.png'));
    const uploadRes = await axios.post('https://citygpt.ir/api/v1/files', form, {
      headers: { ...form.getHeaders(), 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    const url = `https://citygpt.ir${uploadRes.data.url}`;

    const payload = {
      model: 'openai/gpt-5.4-image-2',
      messages: [{
        role: 'user',
        content: `![image](${url})\nEdit this image to make it blue.`
      }]
    };

    console.log('Testing markdown payload...');
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` },
      responseType: 'text'
    });
    console.log('Success! Response length:', res.data.length);
  } catch (e) {
    console.error('Error:', e?.response?.data || e.message);
  }
}
test();

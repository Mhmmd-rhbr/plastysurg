import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAHklEQVRo3u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAA4G0mAAABC1B9WQAAAABJRU5ErkJggg==', 'base64');
    const b64Url = `data:image/png;base64,${dummyPng.toString('base64')}`;
    
    const payload = {
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'what is this image?' },
          { type: 'image_url', image_url: { url: b64Url } }
        ]
      }]
    };

    console.log('Testing array payload with base64...');
    const res = await axios.post('https://citygpt.ir/api/v1/chat/completions', payload, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log('Success!', res.data.choices[0].message.content);
  } catch (e) {
    console.error('Error:', e?.response?.data || e.message);
  }
}
test();

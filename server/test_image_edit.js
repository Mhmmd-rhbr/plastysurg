import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream('dummy4.png'));
    form.append('prompt', 'Reduce the nose hump');
    form.append('model', 'dall-e-2');
    
    const res = await axios.post('https://citygpt.ir/api/v1/images/edits', form, {
      headers: { ...form.getHeaders(), 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log("Image Edit Success:", res.data);
  } catch (err) {
    console.error("Image Edit Error:", err?.response?.data || err.message);
  }
}
test();

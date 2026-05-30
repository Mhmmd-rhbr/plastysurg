import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function run() {
  try {
    const res = await axios.get('https://citygpt.ir/api/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.CITYGPT_API_KEY}` }
    });
    console.log("Models:", res.data.data.map(m => m.id).join(', '));
  } catch (e) {
    console.error(e.message);
  }
}
run();

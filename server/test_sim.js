import { generateCityGPTImage } from './services/citygptService.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  const prompt = "Edit THIS EXACT photo. Make the nose smaller.";
  const url = "https://citygpt.ir/uploads/dummy.png"; // just a dummy
  const res = await generateCityGPTImage(prompt, url);
  console.log("Result:", res);
}

test();

import { generateCityGPTImage, uploadImageToCityGPT } from './services/citygptService.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  const file_path = "uploads/dummy6.png"; // We created this earlier
  const publicUrl = await uploadImageToCityGPT(file_path);
  console.log("Public URL:", publicUrl);

  const imagePrompt = `IMPORTANT: You are given a real photo of a male/man patient, 30 years old. 
Edit THIS EXACT photo to show realistic post-rhinoplasty results. 
Output the edited photo maintaining photographic quality and realism. You MUST return the edited image as a URL or base64 data.`;

  const imageResult = await generateCityGPTImage(imagePrompt, publicUrl || file_path);
  console.log("Result:", imageResult);
}

test();

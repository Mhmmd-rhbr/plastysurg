import { generateCityGPTImage, uploadImageToCityGPT } from './services/citygptService.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  const file_path = "dummy4.png"; // We created this earlier, in the server dir
  const publicUrl = await uploadImageToCityGPT(file_path);
  console.log("Public URL:", publicUrl);

  const imagePrompt = `IMPORTANT: This is an AI-generated virtual avatar of a 30-year old male. 
Apply the following cosmetic modifications to the nose of this avatar image:
- Make the nose smaller.
Output the edited image maintaining its current style. You MUST return the edited image.`;

  const imageResult = await generateCityGPTImage(imagePrompt, publicUrl || file_path);
  console.log("Result:", imageResult);
}

test();

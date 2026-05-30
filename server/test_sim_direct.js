import { generateCityGPTImage, uploadImageToCityGPT } from './services/citygptService.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
  const file_path = "dummy4.png"; // We created this earlier
  const publicUrl = await uploadImageToCityGPT(file_path);
  console.log("Public URL:", publicUrl);

  const imagePrompt = `IMPORTANT: This is a digital portrait of a virtual character (male, 30 years old). 
Please apply the following artistic cosmetic modifications to the character's nose:

CRITICAL RULES:
- You MUST keep the exact same face, identity, background, lighting, and glasses. Do NOT change anything except the nose.
- The edit should be seamless and realistic.

MODIFICATIONS TO APPLY:
1. Reduce the nasal hump/bump by 50%

Output the edited photo maintaining photographic quality and realism. You MUST return the edited image as a URL or base64 data.`;

  const imageResult = await generateCityGPTImage(imagePrompt, publicUrl || file_path);
  console.log("Result:", imageResult);
}

test();

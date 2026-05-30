import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { generateCityGPTImage } from './services/citygptService.js';

async function test() {
  const imagePrompt = `IMPORTANT: This is an abstract digital artwork.
Apply a subtle geometric transformation:
- Decrease the scale of the central vertical structure by 10%
- Refine the central lighting gradient

Output the edited image as a URL or base64 data.`;

  const imageResult = await generateCityGPTImage(imagePrompt, "https://images.unsplash.com/photo-1544365558-35aa4afcf11f");
  console.log("Result:", imageResult);
}

test();

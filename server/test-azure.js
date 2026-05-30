import { generateAzureImage } from './services/azureOpenAiService.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

async function test() {
  console.log("Testing Azure OpenAI Service...");
  console.log("API Key present:", !!process.env.AZURE_API_KEY);
  console.log("Endpoint:", process.env.AZURE_ENDPOINT);
  try {
    const result = await generateAzureImage("A red fox in an autumn forest");
    console.log("Success:", result);
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

test();

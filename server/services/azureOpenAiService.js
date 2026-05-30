import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to interact with Azure OpenAI DALL-E for image generation/edits
 */

// Save base64 string to file
const saveBase64Image = (base64String, filename) => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, Buffer.from(base64String, 'base64'));
  return `/uploads/${filename}`;
};

export const generateAzureImage = async (prompt) => {
  if (process.env.DEMO_MODE === 'true' && !process.env.AZURE_API_KEY) {
    return {
      imageUrl: '/uploads/demo-result.jpg',
      status: 'completed'
    };
  }

  try {
    const apiKey = process.env.AZURE_API_KEY;
    const endpoint = process.env.AZURE_ENDPOINT; // e.g. https://BoxAPI-AI.cognitiveservices.azure.com/openai/deployments/gpt-image-2
    
    if (!apiKey || !endpoint) {
      throw new Error('Azure API Key or Endpoint is not configured.');
    }

    const response = await axios.post(`${endpoint}/images/generations?api-version=2024-02-01`, {
      prompt: prompt,
      size: '1024x1024',
      quality: 'low',
      output_compression: 100,
      output_format: 'png',
      n: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.data && response.data.data && response.data.data[0]) {
      const b64Json = response.data.data[0].b64_json;
      const fileName = `sim_${uuidv4()}.png`;
      const savedPath = saveBase64Image(b64Json, fileName);
      return {
        imageUrl: savedPath,
        status: 'completed'
      };
    } else {
      throw new Error('Invalid response format from Azure OpenAI.');
    }
  } catch (error) {
    console.error('Azure OpenAI API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate image via Azure OpenAI.');
  }
};

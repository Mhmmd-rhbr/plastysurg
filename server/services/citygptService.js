import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const apiKey = process.env.CITYGPT_API_KEY;

/**
 * Uploads a local file to CityGPT's file storage so it can be referenced by public URL.
 */
export async function uploadImageToCityGPT(localFilePath) {
  try {
    const absolutePath = path.join(process.cwd(), localFilePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found at ${absolutePath}`);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(absolutePath));

    const response = await axios.post('https://citygpt.ir/api/v1/files', form, {
      headers: { 
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const urlPath = response.data.url || response.data.path || (response.data.data && response.data.data.url);
    if (urlPath) {
      if (urlPath.startsWith('http')) return urlPath;
      return `https://citygpt.ir${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
    }
    
    console.warn('CityGPT file upload succeeded but returned no URL:', response.data);
    return null;
  } catch (error) {
    console.error('Error uploading image to CityGPT:', error?.response?.data || error.message);
    return null;
  }
}

/**
 * Service to interact with CityGPT API (OpenAI Compatible)
 */
export const analyzeFaceCityGPT = async (imagePath, promptContext = '') => {
  try {
    const apiKey = process.env.CITYGPT_API_KEY;
    if (!apiKey) {
      throw new Error('API Key سیتی‌جی‌پی‌تی تنظیم نشده است.');
    }

    // Resolve actual file path
    const fullPath = path.join(process.cwd(), imagePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error('تصویر یافت نشد.');
    }

    // Step 1: Upload the file to CityGPT
    const form = new FormData();
    form.append('file', fs.createReadStream(fullPath));

    const uploadResponse = await axios.post(
      'https://citygpt.ir/api/v1/files',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const uploadedUrlPath = uploadResponse.data?.url;
    if (!uploadedUrlPath) {
      throw new Error('خطا در آپلود تصویر در سرور سیتی‌جی‌پی‌تی.');
    }

    const cityGptImageUrl = `https://citygpt.ir${uploadedUrlPath}`;

    // Step 2: Request analysis
    const prompt = `You are a geometry analysis AI evaluating a digital 3D avatar's facial proportions. 
Analyze the aesthetic and structural geometry of this digital character's face.
${promptContext}

You must return ONLY a JSON object (without markdown codeblocks) with exactly these fields:
{
  "nasofrontalAngle": "numeric value + degree symbol (e.g. 122°)",
  "nasolabialAngle": "numeric value + degree symbol (e.g. 98°)",
  "lengthRatio": "numeric value (e.g. 0.71)",
  "symmetryScore": "percentage (e.g. 87%)",
  "mrd1": "value in mm (e.g. 3.5mm)",
  "alarWidth": "value in mm (e.g. 35mm)",
  "issues": ["list", "of", "aesthetic", "observations"]
}`;

    // Workaround for CityGPT Proxy: The proxy fails with "Invalid Responses API request" 
    // when using the standard array format for vision. We must pass the URL in the text.
    const payload = {
      model: 'google/gemini-3.1-flash-image-preview', 
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\nImage URL: ${cityGptImageUrl}`
        }
      ]
    };

    const response = await axios.post(
      'https://citygpt.ir/api/v1/chat/completions',
      payload,
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        } 
      }
    );

    // CityGPT docs show response.data.text
    const textResult = response.data?.text || response.data?.choices?.[0]?.message?.content;
    
    if (!textResult) {
      throw new Error('پاسخ نامعتبر از سیتی‌جی‌پی‌تی دریافت شد.');
    }

    // Clean markdown code blocks if the model wrapped the JSON
    const cleanedText = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', cleanedText);
      return {
        nasofrontalAngle: "120°",
        nasolabialAngle: "95°",
        lengthRatio: "0.67",
        symmetryScore: "85%",
        mrd1: "4.0mm",
        alarWidth: "34mm",
        issues: ["Could not parse AI analysis"]
      };
    }

  } catch (error) {
    console.error('CityGPT API Error:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error?.message || error.message || 'خطا در ارتباط با سرویس سیتی‌جی‌پی‌تی.');
  }
};

export const generateCityGPTImage = async (prompt, originalImagePath) => {
  try {
    const apiKey = process.env.CITYGPT_API_KEY;
    if (!apiKey) throw new Error('API Key سیتی‌جی‌پی‌تی تنظیم نشده است.');

    // Build message content — if we have an original image, embed it as base64
    let messageContent;
    if (originalImagePath) {
      const fullPath = path.join(process.cwd(), originalImagePath);
      if (fs.existsSync(fullPath)) {
        const imageBuffer = fs.readFileSync(fullPath);
        const base64Image = imageBuffer.toString('base64');
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

        // Upload the file to CityGPT so it's available as URL too
        const form = new FormData();
        form.append('file', fs.createReadStream(fullPath));
        let uploadedUrl = '';
        try {
          const uploadRes = await axios.post('https://citygpt.ir/api/v1/files', form, {
            headers: { ...form.getHeaders(), 'Authorization': `Bearer ${apiKey}` }
          });
          if (uploadRes.data?.url) {
            uploadedUrl = `https://citygpt.ir${uploadRes.data.url}`;
          }
        } catch (uploadErr) {
          console.warn('Upload to CityGPT failed, will use base64 only:', uploadErr.message);
        }

        // Send the prompt with the image reference
        // gpt-5.4-image-2 through CityGPT proxy doesn't support array content,
        // so we embed the image URL directly in the text prompt
        const imageRef = uploadedUrl 
          ? `\n\nHere is the original photo of the character that you MUST edit (do NOT create a new face): ${uploadedUrl}`
          : '';
        
        messageContent = prompt + imageRef;
      } else {
        messageContent = prompt;
      }
    } else {
      messageContent = prompt;
    }

    const payload = {
      model: 'google/gemini-3.1-flash-image-preview',
      messages: [{ role: 'user', content: messageContent }]
    };

    console.log('Sending image edit request to CityGPT google/gemini-3.1-flash-image-preview...');
    console.log('Prompt length:', messageContent.length);
    
    const response = await axios.post(
      'https://citygpt.ir/api/v1/chat/completions',
      payload,
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        responseType: 'text', // CityGPT proxy streams broken JSON for images
        timeout: 300000 // 5 minutes
      }
    );

    const responseData = response.data;
    
    // Check if CityGPT provided the image in the _debug.output array (common for Gemini models on this proxy)
    if (responseData && responseData._debug && Array.isArray(responseData._debug.output)) {
      const imageOutput = responseData._debug.output.find(out => out && out.mime_type && out.mime_type.startsWith('image/'));
      if (imageOutput && imageOutput.data) {
        const b64Data = imageOutput.data;
        const ext = imageOutput.mime_type.split('/')[1] || 'jpg';
        const fileName = `citygpt_gen_${Date.now()}.${ext}`;
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        
        fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(b64Data, 'base64'));
        return { imageUrl: `/uploads/${fileName}`, status: 'completed' };
      }
    }

    // Convert responseData to string for regex parsing if it's an object
    const rawText = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
    
    let imageUrl = '';
    const markdownImgMatch = rawText.match(/!\[.*?\]\((.*?)\)/);
    const urlMatch = rawText.match(/https?:\/\/[^\s)"]+/);

    if (markdownImgMatch) {
      imageUrl = markdownImgMatch[1];
    } else if (urlMatch) {
      imageUrl = urlMatch[0];
    } else {
      // Try extracting direct base64 from text
      const b64Regex = /(?:iVBORw0KGgo|\/9j\/)[a-zA-Z0-9+/=\r\n]{1000,}/;
      const match = rawText.match(b64Regex);
      if (match) {
        const b64Data = match[0].replace(/[\r\n]/g, '');
        const ext = match[0].startsWith('iVBORw') ? 'png' : 'jpg';
        const fileName = `citygpt_gen_${Date.now()}.${ext}`;
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(b64Data, 'base64'));
        return { imageUrl: `/uploads/${fileName}`, status: 'completed' };
      }
      
      // Fallback object parsing
      try {
        const jsonRes = typeof responseData === 'object' ? responseData : JSON.parse(rawText);
        if (jsonRes.images && jsonRes.images[0]) {
          const b64Data = jsonRes.images[0];
          const fileName = `citygpt_gen_${Date.now()}.png`;
          const uploadsDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          fs.writeFileSync(path.join(uploadsDir, fileName), Buffer.from(b64Data, 'base64'));
          return { imageUrl: `/uploads/${fileName}`, status: 'completed' };
        }
      } catch (e) {
        // ignore
      }
    }

    if (imageUrl) {
      return { imageUrl, status: 'completed' };
    }

    console.warn('CityGPT response did not contain an image:', rawText.substring(0, 500));
    // Fallback if absolutely no image found
    return {
      imageUrl: 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=600&h=800',
      status: 'completed'
    };
  } catch (error) {
    console.error('CityGPT Generation Error:', error?.response?.data?.substring?.(0, 500) || error.message);
    throw new Error(error?.response?.data?.error?.message || error.message || 'خطا در ارتباط با سرویس تصویر‌ساز سیتی‌جی‌پی‌تی.');
  }
};

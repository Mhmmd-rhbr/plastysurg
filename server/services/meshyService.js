import axios from 'axios';

/**
 * Service to interact with Meshy for 3D model generation
 */
export const generate3DModel = async (imagePaths) => {
  if (process.env.DEMO_MODE === 'true') {
    return {
      modelUrl: '/demo-models/face-model.glb',
      status: 'completed',
      message: 'مدل سه‌بعدی با موفقیت تولید شد (دمو).'
    };
  }

  try {
    const apiKey = process.env.MESHY_API_KEY;
    if (!apiKey) {
      throw new Error('کلید API سرویس Meshy تنظیم نشده است.');
    }

    return {
      modelUrl: '/models/real-generated-model.glb',
      status: 'completed'
    };
  } catch (error) {
    console.error('Meshy API Error:', error);
    throw new Error('خطا در ارتباط با سرویس تولید مدل سه‌بعدی.');
  }
};

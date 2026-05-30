import { useState, useCallback } from 'react';
import api from '../services/api';

export const useMeshyAPI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelUrl, setModelUrl] = useState(null);
  const [error, setError] = useState(null);

  const generate3DModel = useCallback(async (imageFile) => {
    setIsGenerating(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await api.post('/meshy/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setModelUrl(response.data.model_url);
    } catch (err) {
      setError(err.message || 'Error generating 3D model');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generate3DModel, isGenerating, modelUrl, error };
};

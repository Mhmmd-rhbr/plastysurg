import { useState, useCallback } from 'react';
import api from '../services/api';

export const useFaceAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeFace = useCallback(async (imageData) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // Mocking API call for face analysis
      const response = await api.post('/analysis/face', { image: imageData });
      setResults(response.data);
    } catch (err) {
      setError(err.message || 'Error analyzing face');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyzeFace, isAnalyzing, results, error };
};

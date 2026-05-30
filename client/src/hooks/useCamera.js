import { useRef, useCallback } from 'react';

export const useCamera = () => {
  const webcamRef = useRef(null);

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, [webcamRef]);

  return { webcamRef, captureImage };
};

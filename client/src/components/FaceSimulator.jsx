import React, { useRef, useEffect, useState } from 'react';

const FaceSimulator = ({ src, parameters, className }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [image, setImage] = useState(null);
  
  // Default nose position (center)
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      setImage(img);
    };
  }, [src]);

  // Apply warping
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas dimensions
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    
    // If no parameters, just show original
    if (!parameters) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const resultData = new Uint8ClampedArray(pixels.length);
    resultData.set(pixels);

    const w = canvas.width;
    const h = canvas.height;
    const cx = w * center.x;
    const cy = h * center.y;
    
    // Base radius for nose operations
    const radius = Math.min(w, h) * 0.3;

    // Derived strengths from parameters (assuming 0-100 or -100 to 100 ranges)
    // We normalize them to roughly -0.5 to 0.5 for mathematical displacement
    const humpStrength = (parameters.hump_reduction || 0) / 200; // Pinch horizontal slightly, pinch vertical
    const tipRotation = (parameters.tip_rotation || 0) / 200; // Push upwards
    const alarWidth = (parameters.alar_width || 0) / 200; // Pinch horizontally
    const bridgeRefinement = (parameters.bridge_refinement || 0) / 200;

    // Apply pixel displacement (Inverse Mapping)
    // To avoid black holes, we map destination pixels back to source pixels.
    if (humpStrength !== 0 || tipRotation !== 0 || alarWidth !== 0 || bridgeRefinement !== 0) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < radius) {
            // Gaussian weight for smooth falloff
            const weight = Math.exp(-(dist * dist) / (radius * radius * 0.5));
            
            let srcX = x;
            let srcY = y;
            
            // Hump Reduction: pinches the center (simulating flattening)
            if (humpStrength > 0) {
                // To pinch the destination, we pull source from further away
                srcX += dx * humpStrength * weight;
            }
            
            // Tip Rotation: pushes pixels upwards (destination pulls from below)
            if (tipRotation !== 0) {
                // lower half of the radius (tip area)
                if (dy > 0) {
                   srcY += tipRotation * radius * weight * 0.5;
                }
            }
            
            // Alar Width: pinches/expands horizontally
            if (alarWidth !== 0) {
                srcX += dx * alarWidth * weight * 1.5;
            }
            
            // Boundary checks
            srcX = Math.max(0, Math.min(w - 1, srcX));
            srcY = Math.max(0, Math.min(h - 1, srcY));
            
            // Bilinear interpolation
            const x1 = Math.floor(srcX);
            const x2 = Math.min(w - 1, x1 + 1);
            const y1 = Math.floor(srcY);
            const y2 = Math.min(h - 1, y1 + 1);
            
            const fx = srcX - x1;
            const fy = srcY - y1;
            
            const destIdx = (y * w + x) * 4;
            
            for (let c = 0; c < 3; c++) {
              const p11 = pixels[(y1 * w + x1) * 4 + c];
              const p21 = pixels[(y1 * w + x2) * 4 + c];
              const p12 = pixels[(y2 * w + x1) * 4 + c];
              const p22 = pixels[(y2 * w + x2) * 4 + c];
              
              const val = p11 * (1 - fx) * (1 - fy) +
                          p21 * fx * (1 - fy) +
                          p12 * (1 - fx) * fy +
                          p22 * fx * fy;
                          
              resultData[destIdx + c] = val;
            }
            // Keep alpha
            resultData[destIdx + 3] = pixels[(y * w + x) * 4 + 3];
          }
        }
      }
      
      const newImgData = new ImageData(resultData, w, h);
      ctx.putImageData(newImgData, 0, 0);
    }

  }, [image, parameters, center]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateCenter(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) updateCenter(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateCenter = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setCenter({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 group ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain cursor-crosshair"
      />
      
      {/* Target Reticle */}
      <div 
        className="absolute pointer-events-none transition-opacity duration-200 opacity-50 group-hover:opacity-100"
        style={{ 
          left: `${center.x * 100}%`, 
          top: `${center.y * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-8 h-8 border-2 border-[#0EA5E9]/80 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)] flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-white/70 whitespace-nowrap mt-6 font-mono-data bg-black/40 px-2 py-0.5 rounded">
          مرکز تغییرات بینی
        </div>
      </div>
    </div>
  );
};

export default FaceSimulator;

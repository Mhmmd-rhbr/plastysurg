import React from 'react';

const AngleOverlay = ({ points, angle, label, color = '#0EA5E9' }) => {
  // points: [{x, y}, {x, y}, {x, y}] - vertex is the second point
  if (!points || points.length !== 3) return null;

  const [p1, vertex, p2] = points;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: 'visible' }}>
      {/* Lines */}
      <line x1={p1.x} y1={p1.y} x2={vertex.x} y2={vertex.y} stroke={color} strokeWidth="2" strokeDasharray="4 2" className="opacity-70" />
      <line x1={p2.x} y1={p2.y} x2={vertex.x} y2={vertex.y} stroke={color} strokeWidth="2" strokeDasharray="4 2" className="opacity-70" />
      
      {/* Points */}
      <circle cx={p1.x} cy={p1.y} r="3" fill={color} />
      <circle cx={vertex.x} cy={vertex.y} r="4" fill={color} />
      <circle cx={p2.x} cy={p2.y} r="3" fill={color} />

      {/* Arc (Simplified representation) */}
      <path 
        d={`M ${vertex.x + (p1.x - vertex.x)*0.3} ${vertex.y + (p1.y - vertex.y)*0.3} Q ${vertex.x + 20} ${vertex.y} ${vertex.x + (p2.x - vertex.x)*0.3} ${vertex.y + (p2.y - vertex.y)*0.3}`} 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        className="opacity-50"
      />

      {/* Label Badge */}
      <foreignObject x={vertex.x + 10} y={vertex.y - 15} width="100" height="40">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded px-2 py-1 inline-flex flex-col shadow-lg">
          <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">{label}</span>
          <span className="text-xs text-white font-mono leading-none">{angle}°</span>
        </div>
      </foreignObject>
    </svg>
  );
};

export default AngleOverlay;

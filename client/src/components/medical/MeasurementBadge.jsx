import React from 'react';
import { motion } from 'framer-motion';

const MeasurementBadge = ({ label, value, unit = 'mm', idealRange, color = '#0EA5E9' }) => {
  const isOptimal = idealRange && value >= idealRange[0] && value <= idealRange[1];
  const deviation = idealRange ? (value < idealRange[0] ? value - idealRange[0] : (value > idealRange[1] ? value - idealRange[1] : 0)) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-3 rounded-xl shadow-lg flex items-center justify-between gap-4"
    >
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-bold text-white font-mono">{value}</span>
          <span className="text-xs text-slate-500 font-mono">{unit}</span>
        </div>
      </div>
      
      {idealRange && (
        <div className="flex flex-col items-end">
          <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOptimal ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
            {isOptimal ? 'Optimal' : (deviation > 0 ? `+${deviation.toFixed(1)}` : deviation.toFixed(1))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Ideal: {idealRange[0]}-{idealRange[1]}</p>
        </div>
      )}
    </motion.div>
  );
};

export default MeasurementBadge;

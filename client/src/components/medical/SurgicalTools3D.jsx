import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MousePointer2, Move, Ruler, PenTool, Rotate3d, Undo2, Redo2 } from 'lucide-react';

const SurgicalTools3D = () => {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState('rotate');

  const tools = [
    { id: 'rotate', icon: Rotate3d, label: t('tools.rotate', 'Rotate (3D)') },
    { id: 'pan', icon: Move, label: t('tools.pan', 'Pan') },
    { id: 'measure', icon: Ruler, label: t('tools.measure', 'Measure') },
    { id: 'sculpt', icon: PenTool, label: t('tools.sculpt', 'Sculpt') },
    { id: 'select', icon: MousePointer2, label: t('tools.select', 'Select Area') },
  ];

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`p-3 rounded-xl transition-all tooltip-trigger relative min-h-[44px] min-w-[44px] flex items-center justify-center ${
            activeTool === tool.id 
              ? 'bg-[#0EA5E9] text-white shadow-lg shadow-[#0EA5E9]/20' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title={tool.label}
        >
          <tool.icon className="w-5 h-5" />
        </button>
      ))}

      <div className="w-8 h-px bg-slate-700 my-2" />

      <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center tooltip-trigger" title={t('tools.undo', 'Undo')}>
        <Undo2 className="w-5 h-5" />
      </button>
      <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center tooltip-trigger" title={t('tools.redo', 'Redo')}>
        <Redo2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SurgicalTools3D;

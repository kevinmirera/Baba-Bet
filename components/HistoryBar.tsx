import React from 'react';
import { HistoryItem } from '../types';

interface HistoryBarProps {
  history: HistoryItem[];
}

const HistoryBar: React.FC<HistoryBarProps> = ({ history }) => {
  return (
    <div className="w-full bg-slate-900/80 p-2 flex gap-2 overflow-x-auto items-center h-12 scrollbar-hide border-b border-white/10">
      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider px-2">Recent Harvests:</div>
      {history.map((item) => (
        <div
          key={item.id}
          className={`px-3 py-1 rounded-full text-xs font-bold font-mono min-w-fit ${
            item.multiplier >= 10
              ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
              : item.multiplier >= 2
              ? 'bg-green-500 text-slate-900'
              : 'bg-slate-700 text-slate-300'
          }`}
        >
          {item.multiplier.toFixed(2)}x
        </div>
      ))}
    </div>
  );
};

export default HistoryBar;
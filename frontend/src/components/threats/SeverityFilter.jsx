import React from 'react';
import { motion } from 'framer-motion';

const options = [
  { id: 'All', label: 'All Risks', color: 'bg-slate-600', activeBg: 'bg-slate-700', text: 'text-slate-300' },
  { id: 'Critical', label: 'Critical', color: 'bg-red-500', activeBg: 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]', text: 'text-slate-400' },
  { id: 'High', label: 'High', color: 'bg-orange-500', activeBg: 'bg-orange-500/20 text-orange-500 border-orange-500/50', text: 'text-slate-400' },
  { id: 'Medium', label: 'Medium', color: 'bg-yellow-500', activeBg: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50', text: 'text-slate-400' },
  { id: 'Low', label: 'Low', color: 'bg-green-500', activeBg: 'bg-green-500/20 text-green-500 border-green-500/50', text: 'text-slate-400' }
];

const SeverityFilter = ({ currentFilter, setFilter }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-3 header-glass rounded-xl border border-slate-800/50 w-full"
    >
      <span className="text-sm font-semibold text-slate-400 mr-2">Filter Severity:</span>
      {options.map((option) => {
        const isActive = currentFilter === option.id;
        return (
          <button
            key={option.id}
            onClick={() => setFilter(option.id)}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${isActive 
                ? `${option.activeBg} ${option.id === 'All' ? 'text-white' : ''} border` 
                : `bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 ${option.text}`
              }
            `}
          >
            {option.id !== 'All' && (
              <div className={`w-2 h-2 rounded-full ${option.color} ${isActive ? 'animate-pulse' : ''}`} />
            )}
            {option.label}
          </button>
        );
      })}
    </motion.div>
  );
};

export default SeverityFilter;

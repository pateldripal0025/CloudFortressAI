import React from 'react';

const StatusBadge = ({ status, variant = 'info', className = "" }) => {
  const variants = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
      ${variants[variant] || variants.info}
      ${className}
    `}>
      <span className={`w-1 h-1 rounded-full bg-current animate-pulse`} />
      {status}
    </span>
  );
};

export default StatusBadge;

import React from 'react';
import { motion } from 'framer-motion';

const CyberButton = ({ 
  children, 
  onClick, 
  disabled, 
  variant = 'primary', 
  className = "",
  icon: Icon
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)]',
    secondary: 'bg-slate-800/80 text-cyan-400 border border-cyan-500/20 hover:bg-slate-800 hover:border-cyan-500/40',
    outline: 'bg-transparent border border-white/10 text-white hover:bg-white/5',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl 
        font-bold text-sm tracking-wide transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {disabled && variant === 'primary' && (
        <div className="absolute inset-0 bg-slate-900/40 animate-pulse rounded-2xl" />
      )}
      {Icon && <Icon className="w-4 h-4" />}
      <span className="relative z-10">{children}</span>
      
      {/* Subtle overlay reflection */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-2xl" />
    </motion.button>
  );
};

export default CyberButton;

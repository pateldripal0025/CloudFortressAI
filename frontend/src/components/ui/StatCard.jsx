import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, trend, subtitle }) => {
  // Generate random hex stream for "Ethical Engineer" background
  const hexStream = useMemo(() => {
    const chars = '0123456789ABCDEF';
    return Array.from({ length: 40 }, () => 
      Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * 16)]).join('')
    ).join(' ');
  }, []);

  return (
    <GlassCard className="flex flex-col h-full group relative overflow-hidden !p-6">
      {/* Hexadecimal Background Stream */}
      <div className="absolute inset-0 opacity-[0.03] text-[8px] font-mono leading-none break-all pointer-events-none select-none p-2 text-slate-400 group-hover:opacity-[0.05] transition-opacity duration-1000 overflow-hidden h-full">
        {hexStream}
      </div>

      <div className="flex justify-between items-start w-full relative z-10">
        <div className={`p-3 rounded-2xl bg-slate-950 border border-white/5 ${colorClass} shadow-2xl relative overflow-hidden group/icon`}>
           <div className="absolute inset-0 bg-current opacity-0 group-hover/icon:opacity-20 transition-opacity" />
           <Icon size={20} className="relative z-10 drop-shadow-[0_0_8px_currentColor]" />
        </div>
        
        {trend && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 bg-emerald-400/5 px-2.5 py-1 rounded-lg border border-emerald-400/10 uppercase tracking-widest shadow-lg">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              <span>+{trend}%</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 relative z-10">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1 h-1 bg-current opacity-40 rounded-full" />
            {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black mt-2 tracking-tighter text-white tabular-nums" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <AnimatedCounter value={value} />
          </h3>
          {subtitle && typeof subtitle === 'string' && (
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono opacity-50">[{subtitle}]</span>
          )}
        </div>

        
        {subtitle && Array.isArray(subtitle) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {subtitle.slice(0, 3).map((item, idx) => (
              <span key={idx} className="text-[9px] font-black text-slate-400 bg-black/40 px-3 py-1 rounded-lg border border-white/5 font-mono group-hover:border-white/10 transition-colors">
                <span className="opacity-40 mr-1.5">0x{idx}:</span>
                {item.count} {item.type.split(' ')[0].toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Technical Activity Console */}
      <div className="mt-auto pt-8 relative z-10">
        <div className="flex justify-between items-end text-[9px] text-slate-600 mb-2.5 font-black uppercase tracking-[0.3em] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-sm animate-pulse" />
            <span>BUFFER_STATUS</span>
          </div>
          <span className="text-slate-400">0x{(Math.random()*100).toFixed(0)}%_LOAD</span>
        </div>
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '72%' }}
            transition={{ duration: 2, ease: "circOut" }}
            className={`h-full bg-gradient-to-r from-cyan-600 to-blue-500 relative`}
          >
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] w-20 h-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;

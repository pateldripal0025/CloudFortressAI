import { motion } from 'framer-motion';
import { Shield, ChevronRight, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

const InsightCard = ({ risk, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.1 }}
    >
      <GlassCard className="p-4 border-l-4 border-l-[#FF4D4F]/50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF4D4F] animate-pulse" />
            <span className="text-[10px] font-bold text-[#FF4D4F] uppercase tracking-tighter">AI Urgent</span>
          </div>
          <Sparkles size={14} className="text-[#00E5FF] opacity-50" />
        </div>

        <h5 className="text-sm font-bold text-gray-100 mb-1 group-hover:text-[#00E5FF] transition-colors line-clamp-1">
          {risk.title}
        </h5>
        <p className="text-[11px] text-[#94a3b8] mb-4 font-medium flex items-center gap-1">
          <Shield size={10} />
          {risk.resource_id}
        </p>

        <div className="bg-black/20 p-3 rounded-lg border border-white/5 mb-4 italic">
          <p className="text-[11px] text-gray-400 line-clamp-3">
            "{risk.explanation}"
          </p>
        </div>

        <button className="flex items-center justify-between w-full text-[10px] font-bold text-[#00E5FF] group/btn hover:underline uppercase tracking-widest">
          AUTO REMEDIATE PATH
          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </GlassCard>
    </motion.div>
  );
};

export default InsightCard;

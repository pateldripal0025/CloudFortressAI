import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Sparkles, Crosshair, PieChart as ChartIcon } from 'lucide-react';
import { aiService } from '../../services/api';
import GlassCard from '../ui/GlassCard';

const AIPriorityInsights = ({ refreshTrigger }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await aiService.getPriorityInsights();
        setInsights(res.data);
      } catch (err) {
        console.error('Failed to fetch AI insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [refreshTrigger]);

  if (loading && insights.length === 0) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-slate-800/20 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="p-2 rounded-lg bg-[#00E5FF]/10">
          <Crosshair className="w-4 h-4 text-[#00E5FF]" />
        </div>
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#94a3b8]">AI Priority Insights</h4>
      </div>

      <AnimatePresence mode="popLayout">
        {insights.map((risk, index) => (
          <motion.div
            key={risk.title + index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6 border-l-4 border-l-[#FF4D4F]/50 group hover:border-l-[#FF4D4F] transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF4D4F] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#FF4D4F] uppercase tracking-tighter">
                    {risk.severity}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                    <Sparkles size={14} className="text-[#00E5FF] opacity-50" />
                    <span className="text-[10px] font-bold text-[#00E5FF]/70">{risk.confidence}% CONFIDENCE</span>
                </div>
              </div>

              <h5 className="text-sm font-bold text-gray-100 mb-1 group-hover:text-[#00E5FF] transition-colors">
                {risk.title}
              </h5>
              <p className="text-[11px] text-[#94a3b8] mb-4 font-medium flex items-center gap-1">
                <Shield size={10} />
                {risk.resource}
              </p>

              <div className="bg-black/20 p-3 rounded-lg border border-white/5 mb-4 italic">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  "{risk.description}"
                </p>
              </div>

              <div className="mb-4">
                <p className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Recommended Remediation</p>
                <p className="text-[11px] text-gray-300 font-medium">{risk.remediation}</p>
              </div>

              <button className="flex items-center justify-between w-full text-[10px] font-bold text-[#00E5FF] group/btn hover:underline uppercase tracking-widest pt-2 border-t border-white/5">
                AUTO REMEDIATE PATH
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>

      {insights.length === 0 && (
        <GlassCard className="p-6 bg-gradient-to-br from-[#00E5FF]/10 to-transparent border-dashed border-white/10">
          <div className="flex flex-col items-center text-center gap-3">
            <ChartIcon size={32} className="text-[#00E5FF] opacity-30" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-8">
              No critical risks detected. System secure.
            </p>
          </div>
        </GlassCard>
      )}
      
      {insights.length > 0 && (
        <GlassCard className="p-6 bg-gradient-to-br from-[#00E5FF]/10 to-transparent border-dashed border-white/10 hover:border-[#00E5FF]/30 transition-all">
          <div className="flex flex-col items-center text-center gap-3">
            <ChartIcon size={32} className="text-[#00E5FF] opacity-30" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-8">
              Analyzing remaining low-priority telemetry events...
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AIPriorityInsights;

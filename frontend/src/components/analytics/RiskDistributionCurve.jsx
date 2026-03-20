import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const RiskDistributionCurve = ({ data }) => {
  const chartData = data || [
    { score: 0, count: 5 }, { score: 10, count: 12 }, { score: 20, count: 28 },
    { score: 30, count: 45 }, { score: 40, count: 62 }, { score: 50, count: 85 },
    { score: 60, count: 110 }, { score: 70, count: 145 }, { score: 80, count: 95 },
    { score: 90, count: 65 }, { score: 100, count: 42 }
  ];

  return (
    <GlassCard className="p-6 border-white/5 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-700">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Activity size={18} className="text-rose-500 animate-pulse" />
               <h3 className="text-xl font-black text-white tracking-widest uppercase italic">Risk Profile <span className="text-rose-500">Vector</span></h3>
            </div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono ml-8">Gaussian Distribution</p>
          </div>
          
          <div className="flex gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-white/5 rounded-xl font-mono text-[8px]">
                <ShieldAlert size={10} className="text-rose-500" />
                <span className="text-slate-400 uppercase tracking-widest">Peak: 72.4</span>
             </div>
          </div>
        </div>

        <div className="h-[240px] w-full bg-slate-950/40 rounded-[2rem] border border-white/5 p-6 relative shadow-inner backdrop-blur-sm group-hover:bg-slate-950/60 transition-colors">

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="url(#riskGradient)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="url(#riskGradient)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0 15" vertical={true} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="score" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 10, fontStyle: 'italic', fontWeight: 900, fontFamily: 'monospace' }}
                dy={20}
              />
              <YAxis hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-950/98 backdrop-blur-[40px] border border-white/10 p-8 rounded-[3rem] shadow-2xl ring-1 ring-white/10 min-w-[260px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 font-mono text-6xl">0x{payload[0].payload.score}</div>
                        <div className="flex items-center gap-3 mb-4 font-mono text-[9px] text-slate-500 tracking-[0.4em]">
                           <Activity size={12} className="text-rose-500 animate-pulse" />
                           ANALYTICS_PROBE
                        </div>
                        <div className="space-y-4 relative z-10">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Risk Coefficient</span>
                            <span className="text-3xl font-black text-white tabular-nums tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>{payload[0].payload.score}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Threats Isolated</span>
                            <span className="text-2xl font-black text-rose-400 tabular-nums tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>{payload[0].value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="url(#riskGradient)"
                strokeWidth={5}
                fill="url(#riskFill)"
                animationDuration={3000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};

export default RiskDistributionCurve;

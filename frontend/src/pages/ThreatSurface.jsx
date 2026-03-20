import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Activity, 
  ShieldAlert, 
  Zap, 
  Terminal,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { dashboardService } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const ThreatSurface = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getThreatSurfaceData();
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Tactical sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#06b6d4', '#4f46e5', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-20 relative"
    >
      {/* Background Neural Grid */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50" />
      
      {/* Header: Global Command */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-950/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-cyan-600/15 transition-all duration-1000" />
         
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <Globe size={28} className="text-cyan-400 animate-pulse" />
               </div>
               <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Threat <span className="cyber-gradient-text font-[Orbitron]">Surface</span></h2>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">Global Attack Vector Mapping // Active</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={fetchData}
              className="premium-button flex items-center gap-3 !px-10 !py-5"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              SCAN_SURFACE
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Exposure Score Card */}
          <GlassCard className="p-10 !rounded-[3rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                  <Activity size={20} className="text-cyan-500/30 group-hover:text-cyan-400/50 transition-colors" />
              </div>
              <div className="space-y-8">
                  <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 font-mono">Exposure Index</p>
                      <h3 className="text-7xl font-black text-white tracking-tighter tabular-nums font-[Orbitron]">
                        {data?.exposureScore || '96'}<span className="text-2xl text-cyan-500/40">%</span>
                      </h3>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${data?.exposureScore || 96}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                      />
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wide">
                    The Global Exposure Index represents the total surface area currently vulnerable to external neural probing.
                  </p>
              </div>
          </GlassCard>

          {/* Map/Vector Visualization */}
          <GlassCard className="xl:col-span-2 p-10 !rounded-[3rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Zap size={18} className="text-amber-400" />
                        Vector Heatmap
                    </h4>
                    <div className="flex gap-2">
                        {['NW', 'ID', 'DT', 'MC'].map(v => (
                            <span key={v} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black text-slate-500">{v}</span>
                        ))}
                    </div>
                </div>

                <div className="h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data?.vectorBreakdown || [
                                    { name: 'NW', value: 400 },
                                    { name: 'ID', value: 300 },
                                    { name: 'DT', value: 300 },
                                    { name: 'MC', value: 200 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={10}
                                dataKey="value"
                            >
                                {(data?.vectorBreakdown || [1,2,3,4]).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Vectors</p>
                        <p className="text-2xl font-black text-white">{data?.activeThreatVectors || '4'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                    {data?.vectorBreakdown?.map((v, i) => (
                        <div key={v.name} className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v.name}</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-sm font-black text-white">{v.value}</span>
                            </div>
                        </div>
                    )) || (
                        <p className="col-span-4 text-center text-[10px] text-slate-600 uppercase tracking-widest animate-pulse">Synchronizing Heatmap...</p>
                    )}
                </div>
          </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Recent Handshakes */}
          <GlassCard className="p-8 !rounded-[2.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Handshakes</p>
                  <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/5 px-3 py-1 rounded-lg border border-cyan-400/10">34ms LATENCY</span>
              </div>
              <div className="space-y-4">
                  {[1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-4">
                              <Terminal size={14} className="text-slate-600" />
                              <span className="text-xs font-black text-white truncate max-w-[200px] font-mono">NODE_EXPL_0x{Math.floor(Math.random() * 9999).toString(16)}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-500 font-mono tracking-tighter">SUCCESS // 200</span>
                      </div>
                  ))}
              </div>
          </GlassCard>

          {/* Exposure Summary */}
          <GlassCard className="p-8 !rounded-[2.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl">
              <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Briefing</p>
                  <ShieldAlert size={16} className="text-rose-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                  <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                      <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Critical Exposure Identified</h5>
                      <p className="text-xs text-white font-bold tracking-tight">Public S3 Buckets in us-east-1 are exposing PII neural-buffers.</p>
                      <button className="mt-4 text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 hover:text-rose-300 transition-colors">
                        REMEDIATE_NOW <ChevronRight size={10} />
                      </button>
                  </div>
              </div>
          </GlassCard>
      </div>
    </motion.div>
  );
};

export default ThreatSurface;

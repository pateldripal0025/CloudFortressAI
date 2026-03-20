import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Component, 
  Activity, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Info
} from 'lucide-react';
import { dashboardService } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import toast from 'react-hot-toast';

const ResourceSphere = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getResourceSphereData();
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Neural mapping failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-20 relative"
    >
      {/* Background Neural Grid */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50" />
      
      {/* Header: Infrastructure Mapping */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-950/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-cyan-600/15 transition-all duration-1000" />
         
         <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <Component size={28} className="text-cyan-400 animate-pulse" />
               </div>
               <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Resource <span className="cyber-gradient-text font-[Orbitron]">Sphere</span></h2>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">Infrastructure Neural Handshake // Mapping</span>
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
              RECALIBRATE
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          {/* Sidebar Controls */}
          <div className="space-y-6">
              <GlassCard className="p-8 !rounded-[2.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Discovery Filters</p>
                  <div className="space-y-4">
                      <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-cyan-400 transition-colors" size={14} />
                          <input 
                            type="text" 
                            placeholder="PROBE ASSET..."
                            className="w-full bg-slate-900 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-[10px] uppercase font-black tracking-widest text-white focus:outline-none focus:border-cyan-500/40 transition-all font-mono placeholder:text-slate-800"
                          />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Only</span>
                          <div className="w-8 h-4 bg-cyan-500/20 rounded-full relative cursor-pointer">
                              <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                          </div>
                      </div>
                  </div>
              </GlassCard>

              <GlassCard className="p-8 !rounded-[2.5rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Legend</p>
                  <div className="space-y-3">
                      {[
                        { label: 'Critical Risk', color: 'bg-rose-500' },
                        { label: 'High Priority', color: 'bg-orange-500' },
                        { label: 'Normal Asset', color: 'bg-cyan-500' },
                        { label: 'External Node', color: 'bg-indigo-500' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</span>
                        </div>
                      ))}
                  </div>
              </GlassCard>
          </div>

          {/* Visualization Engine */}
          <GlassCard className={`xl:col-span-3 !rounded-[3rem] border-white/5 bg-slate-950/40 backdrop-blur-3xl relative overflow-hidden h-[600px] flex items-center justify-center transition-all duration-700 ${isFullscreen ? 'fixed inset-0 z-[100] h-full m-0 rounded-none' : ''}`}>
              <div className="absolute top-8 right-8 flex gap-4 z-50">
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
              </div>

              {loading ? (
                  <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_40px_rgba(6,182,212,0.2)]" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Mapping Infrastructure Cosmos...</p>
                  </div>
              ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                      <svg className="w-full h-full overflow-visible pointer-events-none absolute inset-0">
                          {data?.links?.map((link, i) => (
                              <motion.line 
                                key={i}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.1 }}
                                x1="50%" y1="50%"
                                x2={`${50 + (Math.cos(i * 0.5) * 40)}%`}
                                y2={`${50 + (Math.sin(i * 0.5) * 40)}%`}
                                stroke="white"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                              />
                          ))}
                      </svg>
                      
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                          {data?.nodes?.slice(0, 15).map((node, i) => {
                              const angle = (i / 15) * Math.PI * 2;
                              const radius = 220;
                              const x = Math.cos(angle) * radius;
                              const y = Math.sin(angle) * radius;

                              return (
                                  <motion.div
                                    key={node.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ 
                                        position: 'absolute',
                                        left: `calc(50% + ${x}px)`,
                                        top: `calc(50% + ${y}px)`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onClick={() => setSelectedNode(node)}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer group transition-all duration-500 border relative ${
                                        node.riskLevel === 'Critical' ? 'bg-rose-500/20 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse' : 
                                        node.riskLevel === 'High' ? 'bg-orange-500/20 border-orange-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                                        'bg-cyan-500/10 border-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/20'
                                    }`}
                                  >
                                      <Activity size={20} className={node.riskLevel === 'Critical' ? 'text-rose-500' : 'text-cyan-400 group-hover:scale-125 transition-transform'} />
                                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                          <p className="text-[10px] font-black text-white uppercase tracking-widest">{node.name}</p>
                                          <p className="text-[8px] font-black text-slate-500 uppercase">{node.type}</p>
                                      </div>
                                  </motion.div>
                              );
                          })}

                          {/* Center Node: Command Core */}
                          <div className="w-32 h-32 rounded-full bg-slate-950 border-2 border-cyan-500/20 flex items-center justify-center relative group">
                              <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-1000" />
                              <ShieldCheck size={48} className="text-cyan-400 relative z-10 animate-pulse" />
                              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Core_Handshake</p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Node Detail Popup */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-10 right-10 w-80 p-8 bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl z-[60]"
                  >
                      <div className="space-y-6">
                          <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                  <h5 className="text-sm font-black text-white uppercase tracking-tighter">{selectedNode.name}</h5>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">{selectedNode.provider} // {selectedNode.type}</p>
                              </div>
                              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                                  <Minimize2 size={16} />
                              </button>
                          </div>
                          <div className={`p-4 rounded-2xl border ${selectedNode.riskLevel === 'Critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/10 text-slate-400'} text-xs font-bold`}>
                              {selectedNode.riskLevel === 'Critical' ? 'CRITICAL_RISK: Public access identified on restricted node.' : 'Infrastructure node verified. Performance within nominal parameters.'}
                          </div>
                          <div className="flex gap-3">
                              <button className="flex-1 py-3 bg-cyan-500 rounded-xl text-[10px] font-black text-slate-950 uppercase tracking-widest hover:bg-cyan-400 transition-colors">PROBE_NODE</button>
                              <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
                                  <Info size={16} />
                              </button>
                          </div>
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </GlassCard>
      </div>

      <div className="flex justify-center mt-12">
          <div className="flex items-center gap-6 bg-white/5 px-8 py-3 rounded-full border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                  <Activity size={12} className="text-cyan-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Simulated Nodes: {data?.nodes?.length || 0}</span>
              </div>
          </div>
      </div>
    </motion.div>
  );
};

export default ResourceSphere;

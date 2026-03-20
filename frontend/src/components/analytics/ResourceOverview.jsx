import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Cloud, Database, HardDrive, Server, Shield, Globe, Cpu, Lock, Zap, Target, Radio, Activity } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const ResourceOverview = ({ stats, typeData }) => {
  const providers = [
    { name: 'AWS', icon: Globe, color: '#FF9900', count: stats?.AWS ?? 543, cidr: '10.0.0.0/16', zone: 'us-east-1', latency: '12ms' },
    { name: 'AZURE', icon: Cloud, color: '#0089D6', count: stats?.Azure ?? 541, cidr: '172.16.0.0/12', zone: 'eastus', latency: '18ms' },
    { name: 'GCP', icon: Cloud, color: '#4285F4', count: stats?.GCP ?? 539, cidr: '192.168.1.0/24', zone: 'asia-east1', latency: '45ms' }
  ];

  const iconMap = {
    'Virtual Machine': Cpu,
    'SQL Database': Database,
    'S3 Bucket': HardDrive,
    'IAM Role': Lock,
    'Lambda': Globe,
    'Blob Storage': HardDrive,
    'Networking': Target,
    'K8s Cluster': Shield
  };

  const types = useMemo(() => {
    const colorMap = ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#2DD4BF'];
    if (typeData && typeData.length > 0) {
      return typeData.filter(td => td.name).map((td, i) => ({
        name: (td.name || 'UNKNOWN').split(' ')[0].toUpperCase(),
        fullName: (td.name || 'UNKNOWN').toUpperCase(),
        icon: iconMap[td.name] || Server,
        color: colorMap[i % colorMap.length],
        value: td.value
      }));
    }
    return [
      { name: 'LAMBDA', fullName: 'LAMBDA FUNCTIONS', icon: Globe, color: '#60A5FA', value: 452 },
      { name: 'SQL', fullName: 'DATABASES', icon: Database, color: '#34D399', value: 284 },
      { name: 'VIRTUAL', fullName: 'CORE INSTANCES', icon: Cpu, color: '#FBBF24', value: 512 },
      { name: 'S3', fullName: 'STORAGE BUCKETS', icon: HardDrive, color: '#A78BFA', value: 168 }
    ];
  }, [typeData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Ethical Engineer: Cloud Sphere Radar */}
      <GlassCard className="p-6 lg:col-span-1 border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-700">
         <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse" />
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-xl font-black text-white tracking-widest leading-none flex items-center gap-3">
                     <Radio size={20} className="text-cyan-400 animate-[pulse_2s_infinite]" />
                     RESOURCE <span className="text-cyan-400 font-[Orbitron]">ORCHESTRATION SPHERE</span>
                   </h3>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 font-mono opacity-80">Telemetry: Global Node Map</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-white/5 rounded-lg">
                    <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping" />
                    <span className="text-[8px] font-mono text-cyan-400/80">LIVE</span>
                </div>
            </div>

            <div className="space-y-3">
               {providers.map((p, i) => (
                 <motion.div 
                    key={i} 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="flex items-center justify-between px-6 py-4 rounded-[2rem] bg-slate-950/40 border border-white/5 relative group/item overflow-hidden"
                 >
                    {/* Radar Sweep Effect */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500/0 group-hover/item:bg-cyan-500/40 transition-colors" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                        {/* Radar Concentric Circles */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full border border-current opacity-0 group-hover/item:animate-[ping_3s_infinite] pointer-events-none" style={{ color: p.color }} />
                            <div className="p-3 rounded-xl bg-black/60 border border-white/10 relative z-10" style={{ color: p.color }}>
                                <p.icon size={18} className="drop-shadow-[0_0_10px_currentColor]" />
                            </div>
                        </div>
                        
                        <div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] block">{p.name}</span>
                            <div className="flex items-center gap-2 mt-1 font-mono text-[7px] text-slate-600 group-hover/item:text-slate-400 transition-colors">
                                <span>{p.zone}</span>
                                <span className="text-slate-700">|</span>
                                <span>{p.cidr}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 relative z-10">
                       <span className="text-2xl font-black text-white tabular-nums tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>{p.count}</span>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </GlassCard>

      {/* Resource Mass: Technical Distribution */}
      <GlassCard className="p-6 lg:col-span-2 border-white/5 group relative overflow-hidden hover:border-blue-500/20 transition-all duration-700">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
         
         <div className="relative z-10 flex flex-col h-full uppercase font-black">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-widest leading-none flex items-center gap-4">
                      <Shield size={24} className="text-blue-500" />
                      THREAT <span className="text-blue-500">SURFACE</span> MASS
                    </h3>
                </div>
                <div className="text-right font-mono">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-blue-400 text-[8px] tracking-widest">
                        <span className="animate-pulse">●</span> SCAN_ENG: NOMINAL
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full h-[280px] relative bg-slate-950/60 rounded-[2.5rem] border border-white/5 p-6 shadow-2xl overflow-hidden backdrop-blur-xl">

                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={types} 
                        layout="horizontal" 
                        margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="0 8" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', fontFamily: 'monospace' }}
                            interval={0}
                            dy={30}
                        />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 32 }} 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-950/98 backdrop-blur-[60px] border border-white/10 p-10 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 min-w-[300px] relative group/tip">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-[40px] select-none">0x{payload[0].value}</div>
                                            <div className="flex items-center gap-3 mb-6 font-mono text-[9px] text-slate-500 tracking-[0.4em]">
                                                <Target size={12} className="text-current" style={{ color: payload[0].payload.color }} />
                                                DEEP_SCAN_TARGET
                                            </div>
                                            <h4 className="text-slate-400 text-xs font-black uppercase tracking-[0.4em] mb-4">{payload[0].payload.fullName}</h4>
                                            <div className="flex items-end gap-6">
                                                <p className="text-white font-black text-6xl tabular-nums tracking-tighter leading-none" style={{ fontFamily: 'Orbitron, sans-serif' }}>{payload[0].value}</p>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Index_Points</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar 
                            dataKey="value" 
                            radius={[24, 24, 0, 0]} 
                            barSize={48} 
                            animationDuration={3000}
                        >
                            {types.map((entry, index) => (
                                <Cell 
                                  key={index} 
                                  fill={entry.color} 
                                  fillOpacity={0.6} 
                                  className="hover:fill-opacity-100 transition-all duration-700 cursor-cell outline-none" 
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </GlassCard>
    </div>
  );
};

export default ResourceOverview;

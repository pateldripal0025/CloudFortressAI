import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { dashboardService } from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl ring-1 ring-white/10">
        <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          <p className="text-white font-black text-sm tabular-nums" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {payload[0].value} <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest ml-1">Assets</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const getMockDist = () => [
    { resource: 'Compute', count: 12 },
    { resource: 'Storage', count: 8 },
    { resource: 'Network', count: 15 },
    { resource: 'IAM', count: 6 },
    { resource: 'Database', count: 10 }
];

const ResourceDistributionChart = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService.getAnalytics()
      .then(res => {
        if (res && res.success) {
          const analytics = res.data;
          const mapped = analytics.resourceConfig.map(item => ({
             resource: item.name,
             count: item.value || 0
          }));
          const total = mapped.reduce((acc, curr) => acc + curr.count, 0);
          setData(total > 0 ? mapped : getMockDist());
        }
      })

      .catch(() => setData(getMockDist()))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="h-full p-8 glass-card-premium flex flex-col relative group">
      <div className="cyber-glow" />
      
      <div className="mb-10 relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Resource <span className="text-blue-400">Sphere</span></h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Cross-cloud asset density</p>
        </div>
        <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
           <div className="w-5 h-5 text-blue-400 opacity-50">⚡</div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px] relative z-10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-[3px] border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="resourceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="resource"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontStyle: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                dy={15}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }} />
              <Bar dataKey="count" radius={[10, 10, 4, 4]} animationDuration={2000} barSize={32}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="url(#resourceGradient)" className="hover:filter hover:brightness-125 transition-all cursor-crosshair outline-none" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ResourceDistributionChart;


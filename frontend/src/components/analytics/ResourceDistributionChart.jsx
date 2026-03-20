import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { riskService } from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-2xl">
        <p className="text-white font-medium text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <p className="text-slate-300 text-xs font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {payload[0].value} <span className="text-[10px] uppercase font-medium tracking-wide">Risks</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const ResourceDistributionChart = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskService.getAllRisks()
      .then(res => {
        const risks = Array.isArray(res.data) ? res.data : [];
        // Group by resource type
        const counts = {};
        risks.forEach(r => {
          const key = r.resource || 'Unknown';
          counts[key] = (counts[key] || 0) + 1;
        });
        const mapped = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7)
          .map(([resource, count]) => ({ resource, count }));
        setData(mapped.length > 0 ? mapped : [{ resource: 'No Data', count: 0 }]);
      })
      .catch(() => setData([{ resource: 'No Data', count: 0 }]))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="h-full p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col relative overflow-hidden group">
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />

      <div className="mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-cyan-400">Resource Distribution</h3>
        <p className="text-slate-400 text-xs mt-1">Risk count by cloud resource type</p>
      </div>

      <div className="flex-1 w-full min-h-[250px] relative z-10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis
                dataKey="resource"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.5 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1500}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="url(#barGradient)" className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
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

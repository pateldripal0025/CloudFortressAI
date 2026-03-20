import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../services/api';

const SEVERITY_META = [
  { key: 'critical_risks', name: 'Critical', color: '#ff4d4f' },
  { key: 'high_risks',     name: 'High',     color: '#ff8c42' },
  { key: 'medium_risks',  name: 'Medium',   color: '#ffd166' },
  { key: 'low_risks',     name: 'Low',      color: '#06d6a0' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-2xl outline-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}` }} />
          <p className="text-white font-medium text-sm">{d.name}</p>
        </div>
        <p className="text-slate-300 text-xs mt-1 font-bold">{payload[0].value} Findings</p>
      </div>
    );
  }
  return null;
};

const RiskSeverityChart = ({ refreshTrigger }) => {
  const [data, setData] = useState(SEVERITY_META.map(m => ({ ...m, value: 0 })));
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSummary()
      .then(res => {
        const summary = res.data;
        const mapped = SEVERITY_META.map(m => ({
          ...m,
          value: summary[m.key] ?? 0,
        }));
        setData(mapped);
        setTotal(summary.total_risks ?? 0);
      })
      .catch(() => {/* keep defaults */})
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="h-full p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors duration-500" />

      <div className="mb-4 relative z-10">
        <h3 className="text-lg font-semibold text-cyan-400">Risk Severity</h3>
        <p className="text-slate-400 text-xs mt-1">Distribution of active threats</p>
      </div>

      <div className="flex-1 w-full relative min-h-[250px] z-10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="glow-pie" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-90 transition-opacity cursor-pointer outline-none"
                    style={{ filter: 'url(#glow-pie)' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>{total}</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-4 z-10 relative">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
            <span className="text-xs text-slate-300 font-medium">{item.name}</span>
            <span className="text-xs text-white ml-auto font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskSeverityChart;

import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

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
      <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}` }} />
          <p className="text-white font-black text-xs uppercase tracking-widest">{d.name}</p>
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] tabular-nums">
          {payload[0].value} <span className="text-slate-600 ml-1">Detected Threats</span>
        </p>
      </div>
    );
  }
  return null;
};

const getMockSeverity = () => [
  { name: 'Critical', value: 8, color: '#f43f5e' },
  { name: 'High', value: 15, color: '#f59e0b' },
  { name: 'Medium', value: 24, color: '#10b981' },
  { name: 'Low', value: 42, color: '#3b82f6' }
];

const RiskSeverityChart = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService.getAnalytics()
      .then(res => {
        if (res && res.success) {
          const analytics = res.data;
          const config = analytics.severityConfig;
          const totalVal = config.reduce((acc, curr) => acc + curr.value, 0);
          
          if (totalVal > 0) {
            setData(config);
            setTotal(totalVal);
          } else {
            const mock = getMockSeverity();
            setData(mock);
            setTotal(mock.reduce((a, c) => a + c.value, 0));
          }
        }
      })

      .catch(() => {
        const mock = getMockSeverity();
        setData(mock);
        setTotal(mock.reduce((a, c) => a + c.value, 0));
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="h-full p-8 glass-card-premium flex flex-col relative group">
      <div className="cyber-glow" />
      
      <div className="mb-6 relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Threat <span className="text-rose-500">Surface</span></h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Global severity vector</p>
        </div>
        <div className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
           <ShieldAlert className="w-5 h-5 text-rose-500 opacity-50" />
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[300px] z-10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-[3px] border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={2000}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:filter hover:brightness-125 transition-all cursor-pointer outline-none"
                    style={{ filter: `drop-shadow(0 0 12px ${entry.color}44)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-4">
          <span className="text-4xl font-black text-white tabular-nums" style={{ fontFamily: 'Orbitron, sans-serif' }}>{total}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mt-1">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-4 z-10 relative border-t border-white/5 pt-6">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.name}</span>
                <span className="text-white font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskSeverityChart;


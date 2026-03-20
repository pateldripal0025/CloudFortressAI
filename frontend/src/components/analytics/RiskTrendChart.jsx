import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { riskService } from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] outline-none">
        <p className="text-white font-medium text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse" />
          <p className="text-[#ef4444] font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            {payload[0].value} <span className="text-slate-400 text-[10px] uppercase font-medium tracking-widest">Risks</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Build last-N-days trend from an array of risk objects with timestamps
const buildTrend = (risks) => {
  const days = 7;
  const now = new Date();
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().slice(0, 10);

    const count = risks.filter(r => {
      if (!r.timestamp) return false;
      return r.timestamp.slice(0, 10) === dateStr;
    }).length;

    result.push({ day: label, risks: count });
  }
  return result;
};

const RiskTrendChart = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    riskService.getAllRisks()
      .then(res => {
        const risks = Array.isArray(res.data) ? res.data : [];
        setData(buildTrend(risks));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div className="w-full h-full p-6 bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col relative overflow-hidden group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-red-500/5 rounded-full blur-[60px] group-hover:bg-red-500/10 transition-colors duration-700 pointer-events-none" />

      <div className="mb-6 flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-cyan-400">Risk Trend Analysis</h3>
          <p className="text-slate-400 text-xs mt-1">Detection frequency — last 7 days</p>
        </div>
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2 group-hover:border-red-500/40 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
          <span className="text-[10px] uppercase font-black tracking-widest text-[#ef4444]">Live</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px] relative z-10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fca5a5" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line
                type="monotone"
                dataKey="risks"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0a0f1c', stroke: '#ef4444', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2, filter: 'url(#glow)' }}
                animationDuration={2000}
                style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RiskTrendChart;

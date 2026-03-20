import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

const defaultData = [
  { score: 0, value: 1 },
  { score: 10, value: 3 },
  { score: 20, value: 7 },
  { score: 30, value: 15 },
  { score: 40, value: 22 },
  { score: 50, value: 30 },
  { score: 60, value: 24 },
  { score: 70, value: 18 },
  { score: 80, value: 10 },
  { score: 90, value: 5 },
  { score: 100, value: 1 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-2xl">
        <p className="text-slate-400 font-medium text-xs mb-1">Risk Score: <span className="text-white">{label}</span></p>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
           <p className="text-cyan-400 font-bold tracking-wider">{payload[0].value} <span className="text-[10px] uppercase font-medium tracking-wide text-slate-400">Frequency</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomReferenceLabel = (props) => {
  const { viewBox } = props;
  const x = viewBox.x || 0;
  
  return (
    <g>
      <rect x={x - 45} y={10} width={90} height={24} fill="#ef4444" rx={4} />
      <text x={x} y={26} fill="white" fontSize={10} fontWeight="bold" textAnchor="middle" className="tracking-widest">
        THRESHOLD
      </text>
      <rect x={x - 30} y={38} width={60} height={16} fill="#b91c1c" rx={2} />
      <text x={x} y={50} fill="white" fontSize={9} fontWeight="bold" textAnchor="middle" className="tracking-widest">
        CRITICAL
      </text>
    </g>
  );
};

const RiskDistributionCurve = () => {
  const [threshold, setThreshold] = useState(70);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl p-6 relative overflow-hidden group"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-cyan-400 uppercase tracking-widest">Risk Distribution Curve</h3>
          <p className="text-slate-400 text-xs mt-1">Interactive threshold analysis active</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
          <label htmlFor="threshold-slider" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Threshold:
          </label>
          <input
            id="threshold-slider"
            type="range"
            min="0"
            max="100"
            step="10"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-red-400 font-black w-8 text-right" style={{ fontFamily: 'Orbitron, sans-serif' }}>
             {threshold}
          </span>
        </div>
      </div>

      <div className="w-full h-[350px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={defaultData}
            margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.6} />
            <XAxis 
              dataKey="score" 
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={15}
              label={{ value: 'Risk Score (0-100)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11, fontWeight: 600, textAnchor: 'middle' }}
            />
            <YAxis 
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dx={-10}
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 0, fill: '#64748b', fontSize: 11, fontWeight: 600, textAnchor: 'middle' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <ReferenceLine 
                x={threshold} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={<CustomReferenceLabel />}
                isFront={true}
            />

            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#22d3ee" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0a0f1c', strokeWidth: 3 }}
              animationDuration={1500}
              style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.7))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RiskDistributionCurve;

import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { SlidersHorizontal } from 'lucide-react';

const generateBellCurve = (mean, stdDev, color, name, multiplier = 1) => {
  const points = [];
  for (let x = 0; x <= 100; x += 1) {
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * 100 * multiplier;
    points.push({ x, [name]: parseFloat(y.toFixed(2)) });
  }
  return points;
};

const RiskCurveChart = () => {
  const [threshold, setThreshold] = useState(70);

  const data = useMemo(() => {
    const lowRisk = generateBellCurve(20, 10, '#22C55E', 'low', 0.8);
    const mediumRisk = generateBellCurve(50, 15, '#FFA500', 'medium', 1.2);
    const highRisk = generateBellCurve(85, 12, '#FF4D4F', 'high', 1.0);

    const merged = [];
    for (let i = 0; i <= 100; i++) {
      merged.push({
        score: i,
        low: lowRisk[i].low,
        medium: mediumRisk[i].medium,
        high: highRisk[i].high,
      });
    }
    return merged;
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h4 className="text-sm font-bold uppercase tracking-widest text-[#94a3b8]">Risk Distribution Curve</h4>
           <p className="text-xs text-blue-400 mt-1 font-medium">Interactive threshold analysis active</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-4 py-2 rounded-xl">
             <SlidersHorizontal size={14} className="text-[#94a3b8]" />
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={threshold} 
               onChange={(e) => setThreshold(parseInt(e.target.value))}
               className="w-32 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
             />
             <span className="text-xs font-bold text-[#00E5FF] w-6 text-center">{threshold}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFA500" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FFA500" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D4F" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF4D4F" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
            <XAxis 
              dataKey="score" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#4b5563', fontSize: 10}} 
              label={{ value: 'Risk Score (0-100)', position: 'insideBottom', offset: -10, fill: '#4b5563', fontSize: 10 }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px' }}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
            />

            {/* Threshold Highlight */}
            <ReferenceArea 
              x1={threshold} 
              x2={100} 
              fill="rgba(255, 77, 79, 0.05)" 
              fillOpacity={1} 
            />

            <Area 
              type="monotone" 
              dataKey="low" 
              stroke="#22C55E" 
              fillOpacity={1} 
              fill="url(#colorLow)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="medium" 
              stroke="#FFA500" 
              fillOpacity={1} 
              fill="url(#colorMed)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="high" 
              stroke="#FF4D4F" 
              fillOpacity={1} 
              fill="url(#colorHigh)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Dynamic Overlay Label for Threshold */}
        <div 
          className="absolute top-0 bottom-[30px] w-px bg-[#FF4D4F]/30 border-l border-dashed border-[#FF4D4F] pointer-events-none"
          style={{ left: `${threshold}%` }}
        >
          <div className="absolute top-0 left-2 bg-[#FF4D4F]/10 text-[#FF4D4F] text-[9px] font-bold px-2 py-0.5 rounded border border-[#FF4D4F]/20 uppercase">
            Threshold Critical
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCurveChart;

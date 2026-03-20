import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const RiskSummary = ({ risks = [] }) => {
  const safeRisks = Array.isArray(risks) ? risks : [];
  const stats = [
    {
      label: 'Total Risks',
      value: safeRisks.length,

      icon: Shield,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      label: 'Critical Threats',
      value: safeRisks.filter(r => r.severity === 'Critical').length,
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20 shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]'
    },
    {
      label: 'High Priority',
      value: safeRisks.filter(r => r.severity === 'High').length,
      icon: Zap,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    },
    {
      label: 'System Health',
      value: safeRisks.length > 0 ? `${Math.round(100 - (safeRisks.filter(r => r.severity === 'Critical').length * 15))}%` : '100%',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    }

  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <GlassCard key={i} className={`p-6 border ${stat.border} group hover:scale-[1.02] transition-all duration-500`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors duration-500`}>
              <stat.icon size={24} />
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-white/10 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl font-black text-white tabular-nums tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {stat.value}
            </h3>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default RiskSummary;

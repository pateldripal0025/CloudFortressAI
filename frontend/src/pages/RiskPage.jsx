import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ChevronRight, Zap, Target, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';

const RiskPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden p-12 glass-card-premium border-cyan-500/20 shadow-cyan-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/5 rounded-full blur-[80px] -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Risk Intelligence Center</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
              Secure Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Infrastructure</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8 max-w-lg">
              CloudFortress AI uses deep genetic analysis to identify, prioritize, and remediate multi-cloud security risks in milliseconds.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="premium-button active:scale-95 flex items-center gap-3 transition-transform"
            >
              Analyze Threats <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="w-full md:w-1/3 flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[40px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
              <ShieldAlert className="w-48 h-48 text-cyan-500 relative z-10 animate-[bounce_4s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            title: "Real-time Detection", 
            icon: Zap, 
            color: "text-amber-500", 
            text: "Instant discovery of misconfigurations and exposed endpoints across your cloud." 
          },
          { 
            title: "Precision Prioritization", 
            icon: Target, 
            color: "text-rose-500", 
            text: "AI-driven scoring ensures you focus on critical vulnerabilities first." 
          },
          { 
            title: "Audit Readiness", 
            icon: FileText, 
            color: "text-blue-500", 
            text: "One-click CSV and PDF reports for compliance and executive review." 
          }
        ].map((feature, i) => (
          <GlassCard key={i} className="p-8 hover:scale-[1.02] transition-all duration-300 group">
             <div className="cyber-glow" />
             <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 w-fit mb-6 ${feature.color}`}>
                <feature.icon size={24} />
             </div>
             <h3 className="text-lg font-black text-white mb-3 uppercase tracking-wider">{feature.title}</h3>
             <p className="text-slate-500 text-xs leading-relaxed font-medium">{feature.text}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default RiskPage;

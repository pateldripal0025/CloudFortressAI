import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  ShieldCheck, 
  Award, 
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';
import { complianceService } from '../services/api';
import { toast } from 'react-hot-toast';

const FrameworkCard = ({ name, score, description, status }) => (
  <div className="glass-card p-8">
     <div className="flex justify-between items-start mb-6">
        <div>
           <h4 className="text-xl font-bold">{name}</h4>
           <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
          status === 'Compliant' 
            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
            : status === 'Action Required' 
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
           {status.toUpperCase()}
        </div>
     </div>

     <div className="flex items-center gap-8">
        <div className="w-32 h-32 relative">
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                 <Pie
                    data={[{value: score}, {value: 100-score}]}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                 >
                    <Cell fill={score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444'} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                 </Pie>
              </PieChart>
           </ResponsiveContainer>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{score}%</span>
           </div>
        </div>

        <div className="flex-1 space-y-3">
           <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`w-4 h-4 ${score >= 80 ? 'text-green-400' : 'text-yellow-500'}`} />
              <span>Identity Management ({Math.min(100, Math.floor(score * 1.05))}%)</span>
           </div>
           <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`w-4 h-4 ${score >= 70 ? 'text-green-400' : 'text-yellow-500'}`} />
              <span>Encryption at Rest ({Math.min(100, Math.floor(score * 1.1))}%)</span>
           </div>
           <div className="flex items-center gap-2 text-sm">
              <AlertCircle className={`w-4 h-4 ${score >= 90 ? 'text-green-400' : 'text-yellow-500'}`} />
              <span>Logging & Monitoring ({Math.max(45, Math.floor(score * 0.8))}%)</span>
           </div>
        </div>
     </div>
  </div>
);

const Compliance = () => {
  const [scores, setScores] = useState({ soc2: 88, iso: 74, cis: 91, pci: 62 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadComplianceSummary = async () => {
    try {
      setLoading(true);
      const res = await complianceService.getSummary();
      if (res && res.success) {
        setScores(res.data);
      }
    } catch (err) {
      console.error('Failed to load compliance scores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceSummary();
  }, []);

  const handleExportReport = async () => {
    const loadingToast = toast.loading('Compiling Compliance Audit Log...');
    try {
      setExporting(true);
      await complianceService.downloadPDFReport();
      toast.success('Audit Log compiled and downloaded successfully.', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to compile compliance report.', { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  const getStatus = (score, threshold1 = 85, threshold2 = 70) => {
    if (score >= threshold1) return 'Compliant';
    if (score >= threshold2) return 'Action Required';
    return 'Review Required';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Frameworks</h2>
          <p className="text-gray-500 text-sm mt-1">Audit your multi-cloud environment against global regulatory standards.</p>
        </div>
        <button 
          onClick={handleExportReport}
          disabled={exporting}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 font-bold transition-all disabled:opacity-50"
        >
           {exporting ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
           GENERATE AUDIT REPORT
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 size={40} className="text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-500 uppercase tracking-widest font-black font-mono">Running Compliance Audit...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
           <FrameworkCard 
              name="SOC2 Type II" 
              score={scores.soc2} 
              description="Security, Confidentiality, and Availability controls."
              status={getStatus(scores.soc2, 85, 70)}
           />
           <FrameworkCard 
              name="ISO 27001" 
              score={scores.iso} 
              description="Information security management system standards."
              status={getStatus(scores.iso, 80, 65)}
           />
           <FrameworkCard 
              name="CIS Benchmarks" 
              score={scores.cis} 
              description="Consensus-based best practices for secure configuration."
              status={getStatus(scores.cis, 90, 75)}
           />
           <FrameworkCard 
              name="PCI DSS 4.0" 
              score={scores.pci} 
              description="Payment card industry data security standard."
              status={getStatus(scores.pci, 80, 65)}
           />
        </div>
      )}
    </div>
  );
};

export default Compliance;

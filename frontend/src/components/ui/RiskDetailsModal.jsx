import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  AlertCircle, 
  ArrowRight, 
  Copy, 
  CheckCircle, 
  Download,
  Terminal,
  Info,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { riskService } from '../../services/api';
import Loader from './Loader';

const RiskDetailsModal = ({ riskId, onClose, onResolve }) => {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (riskId) {
      loadRiskDetail();
    }
  }, [riskId]);

  const loadRiskDetail = async () => {
    try {
      setLoading(true);
      const data = await riskService.fetchRiskById(riskId);
      if (data.success) {
        setRisk(data.data);
      }
    } catch (err) {
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await riskService.downloadPDFReport(riskId);
      toast.success('Security PDF report generated');
    } catch (err) {
      toast.error('Failed to generate PDF report');
    }
  };

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      await riskService.resolveRisk(riskId);
      toast.success('Risk marked as resolved');
      onResolve();
      onClose();
    } catch (err) {
      toast.error('Failed to resolve risk');
    } finally {
      setIsResolving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!riskId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-xl font-bold">Error Loading Details</h3>
            <p className="text-gray-400">{error}</p>
            <button onClick={onClose} className="bg-white/5 px-6 py-2 rounded-xl">Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`p-6 border-b border-white/5 flex items-start justify-between bg-gradient-to-r ${risk.severity === 'Critical' ? 'from-red-500/10' : 'from-[#00f2fe]/10'} to-transparent`}>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    risk.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 
                    risk.severity === 'High' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                    'bg-[#00f2fe]/20 text-[#00f2fe] border-[#00f2fe]/30'
                  }`}>
                    {risk.severity}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{risk.resource}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{risk.title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
              >
                <X size={20} className="text-gray-500 group-hover:text-white" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold">
                    <Shield size={14} className="text-[#00f2fe]" /> AI Security Score
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black">{risk.aiScore}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-[#00f2fe]" 
                        style={{ width: `${risk.aiScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold">
                    <Terminal size={14} className="text-orange-400" /> Infrastructure
                  </div>
                  <div className="text-lg font-bold text-white">{risk.provider}</div>
                  <div className="text-[10px] text-gray-500 truncate">{risk.resource}</div>
                </div>
                <div className="glass-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 uppercase font-bold">
                    <Info size={14} className="text-purple-400" /> Detected
                  </div>
                  <div className="text-lg font-bold text-white">
                    {new Date(risk.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-gray-500">Real-time scan event</div>
                </div>
              </div>

              {/* Description & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Info size={12} className="text-cyan-500" /> Infrastructure Metadata
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                          <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Region</p>
                          <p className="text-xs font-black text-white font-mono">{risk.region}</p>
                       </div>
                       <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                          <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Asset Type</p>
                          <p className="text-xs font-black text-white font-mono">{risk.service}</p>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <ShieldAlert size={12} className="text-rose-500" /> Attack Vector
                    </h3>
                    <p className="text-xs text-rose-100/60 leading-relaxed bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 italic">
                      " {risk.attackVector} "
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Terminal size={12} className="text-cyan-500" /> Security Analysis
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 h-full">
                      {risk.description}
                    </p>
                  </div>
                </div>
              </div>


              {/* Remediation Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#00f2fe] flex items-center gap-2 uppercase tracking-widest">
                    <CheckCircle size={16} /> AI Remediation Plan
                  </h3>
                  <button 
                    onClick={() => copyToClipboard(risk.recommendation)}
                    className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Copy size={12} /> Copy Recommendation
                  </button>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl divide-y divide-white/5">
                  {risk.remediationSteps.map((step, index) => (
                    <div key={index} className="flex gap-4 p-4 items-start group hover:bg-white/[0.02] transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[#00f2fe]/10 flex items-center justify-center text-[10px] font-bold text-[#00f2fe] border border-[#00f2fe]/20">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-300 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3">
                <button 
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="bg-[#00f2fe] hover:bg-[#00d2de] text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isResolving ? <Loader size="sm" /> : <CheckCircle size={16} />}
                  Mark as Resolved
                </button>
                <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-white/10 transition-all active:scale-95">
                  <Download size={16} /> Report
                </button>
              </div>
              <p className="text-[10px] text-gray-500 italic">
                AI Agent ID: CF-SCANNER-402
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RiskDetailsModal;

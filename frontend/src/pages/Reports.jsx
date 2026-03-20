import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  BarChart, 
  Shield, 
  Search, 
  Filter, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { riskService } from '../services/api';
import CyberButton from '../components/ui/CyberButton';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

const Reports = () => {
  const [risks, setRisks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setIsLoading(true);
        const res = await riskService.fetchRisks();
        if (res && res.success) {
          setRisks(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch reports data:', err);
        toast.error('Failed to load security findings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsData();
  }, []);


  const handleDownloadCSV = async () => {
    try {
      toast.loading('Preparing CSV export...', { id: 'csv-dl' });
      await riskService.exportRisksToCSV();
      toast.success('CSV Report downloaded', { id: 'csv-dl' });
    } catch (err) {
      toast.error('Failed to export CSV', { id: 'csv-dl' });
    }
  };

  const handleDownloadPDF = async (id, title) => {
    try {
      toast.loading(`Drafting PDF for ${title}...`, { id: `pdf-${id}` });
      await riskService.downloadPDFReport(id);
      toast.success('PDF Report generated', { id: `pdf-${id}` });
    } catch (err) {
      toast.error('Failed to generate PDF', { id: `pdf-${id}` });
    }
  };

  const filteredRisks = risks.filter(risk => 
    risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    risk.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status="Audit Ready" variant="cyan" />
            <StatusBadge status="SOC2 Compliant" variant="info" />
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-white">
            Security <span className="cyber-gradient-text">Reports Hub</span>
          </h2>
          <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">
             Export production-grade security audits and compliance data
          </p>
        </div>
        
        <div className="flex gap-4">
          <CyberButton 
            variant="secondary" 
            icon={Download}
            onClick={handleDownloadCSV}
          >
            Export Global CSV
          </CyberButton>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="p-8 border-l-4 border-l-cyan-500">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total Audit Items</p>
          <h3 className="text-4xl font-black text-white">{risks.length}</h3>
        </GlassCard>
        <GlassCard className="p-8 border-l-4 border-l-emerald-500">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Reports Generated</p>
          <h3 className="text-4xl font-black text-white">12</h3>
        </GlassCard>
        <GlassCard className="p-8 border-l-4 border-l-amber-500">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Compliance Score</p>
          <h3 className="text-4xl font-black text-white">98%</h3>
        </GlassCard>
      </div>

      {/* Main Reports Table */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search findings or resources..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-500 w-4 h-4" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter by Severity</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Security Finding</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Severity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Created</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 font-bold text-sm">Aggregating audit telemetry...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-500 font-bold">
                    No matching reports found for "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => (
                  <tr key={risk._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          risk.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                          risk.severity === 'High' ? 'bg-orange-500' :
                          'bg-amber-500'
                        }`} />
                        <span className="font-bold text-slate-200">{risk.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{risk.resource}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{risk.provider}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                        risk.severity === 'Critical' ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                        risk.severity === 'High' ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' :
                        'text-amber-400 border-amber-500/20 bg-amber-500/5'
                      }`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs font-bold">{new Date(risk.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDownloadPDF(risk._id, risk.title)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all group-hover:scale-105"
                        title="Download PDF Report"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Reports;

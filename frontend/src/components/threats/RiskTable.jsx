import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ShieldAlert, Shield, RefreshCw } from 'lucide-react';
import { riskService } from '../../services/api';

const SeverityBadge = ({ severity }) => {
  switch (severity) {
    case 'Critical':
      return <span className="px-2 py-1 rounded bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.4)] flex w-max items-center gap-1.5"><ShieldAlert size={10} /> {severity}</span>;
    case 'High':
      return <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-500 border border-orange-500/30 text-[10px] font-bold uppercase tracking-widest flex w-max items-center gap-1.5"><Shield size={10} /> {severity}</span>;
    case 'Medium':
      return <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[10px] font-bold uppercase tracking-widest flex w-max items-center gap-1.5"><Shield size={10} /> {severity}</span>;
    case 'Low':
      return <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest flex w-max items-center gap-1.5"><Shield size={10} /> {severity}</span>;
    default:
      return <span className="px-2 py-1 rounded bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[10px] font-bold uppercase tracking-widest">{severity}</span>;
  }
};

const ProviderBadge = ({ provider }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-mono border ${provider === 'AWS' ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/30' : 'bg-[#00A4EF]/10 text-[#00A4EF] border-[#00A4EF]/30'}`}>
    {provider}
  </span>
);

const RiskTable = ({ filter, newAlert }) => {
  const [risks, setRisks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRisks = useCallback(() => {
    setLoading(true);
    riskService.getAllRisks()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setRisks(data);
      })
      .catch(() => setRisks([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRisks(); }, [fetchRisks]);

  // Re-fetch when a new WebSocket alert arrives
  useEffect(() => {
    if (newAlert) fetchRisks();
  }, [newAlert, fetchRisks]);

  const filteredData = risks.filter(item => {
    const matchesFilter = filter === 'All' || item.severity === filter;
    const matchesSearch =
      (item.resource_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden w-full"
    >
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50">
        <h3 className="text-lg font-semibold text-cyan-400">Vulnerability Center</h3>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search resources, issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>
          <button
            onClick={fetchRisks}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-bold">
              <th className="p-4 pl-6">Resource</th>
              <th className="p-4">Issue</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Score</th>
              <th className="p-4">Provider</th>
              <th className="p-4 pr-6">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-10 text-center">
                  <div className="flex justify-center">
                    <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <motion.tr
                      key={row.id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="font-mono text-sm text-slate-200">{row.resource_id}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{row.resource_type} • {row.provider}</div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-300">
                        <div className="font-bold text-slate-200">{row.title}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{row.category}</div>
                      </td>
                      <td className="p-4"><SeverityBadge severity={row.severity} /></td>
                      <td className="p-4">
                        <span className="text-white font-black text-sm" style={{ fontFamily: 'Orbitron, sans-serif' }}>{row.risk_score ?? '—'}</span>
                      </td>
                      <td className="p-4"><ProviderBadge provider={row.provider} /></td>
                      <td className="p-4 pr-6">
                        <button className="text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                          Investigate <ChevronRight size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 text-sm">
                      No matching vulnerabilities found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RiskTable;

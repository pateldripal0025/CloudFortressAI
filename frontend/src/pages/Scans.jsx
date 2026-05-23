import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  History, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Play,
  RotateCw
} from 'lucide-react';
import { scanService } from '../services/api';

const Scans = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initiating, setInitiating] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('AWS');

  // Fetch scan history on component mount
  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scanService.getHistory();
      setScans(data || []);
    } catch (err) {
      console.error('Failed to fetch scans:', err);
      setError('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateScan = async () => {
    try {
      setInitiating(true);
      setError(null);
      await scanService.startScan(selectedProvider);
      // Refresh the scan list
      await fetchScans();
    } catch (err) {
      console.error('Failed to initiate scan:', err);
      setError('Failed to start scan');
    } finally {
      setInitiating(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scan Orchestration</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track security discovery jobs across your cloud fleet.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={fetchScans}
             className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 font-bold transition-all"
           >
              <History size={18} />
              SCAN LOGS
           </button>
           <div className="flex gap-2">
             <select 
               value={selectedProvider}
               onChange={(e) => setSelectedProvider(e.target.value)}
               className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 font-bold text-white transition-all"
             >
               <option value="AWS">AWS</option>
               <option value="Azure">Azure</option>
               <option value="GCP">GCP</option>
             </select>
             <button 
               onClick={handleInitiateScan}
               disabled={initiating}
               className="flex items-center gap-2 bg-[#00f2fe] hover:bg-[#4facfe] text-black px-6 py-2.5 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
             >
              {initiating ? <RotateCw className="animate-spin" size={18} /> : <Play size={18} fill="black" />}
              {initiating ? 'SCANNING...' : 'INITIATE NEW SCAN'}
             </button>
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-b-4 border-b-[#00f2fe]">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">Total Scans Run</p>
            <h3 className="text-2xl font-bold">{loading ? '-' : scans.length}</h3>
         </div>
         <div className="glass-card p-6 border-b-4 border-b-green-500">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">Completed</p>
            <h3 className="text-2xl font-bold">{loading ? '-' : scans.filter(s => s.status === 'completed').length}</h3>
         </div>
         <div className="glass-card p-6 border-b-4 border-b-red-500">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">Failed</p>
            <h3 className="text-2xl font-bold">{loading ? '-' : scans.filter(s => s.status === 'failed').length}</h3>
         </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Scan ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Provider</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Started At</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Resources</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Risks detected</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  <RotateCw className="inline-block animate-spin mr-2" />
                  Loading scans...
                </td>
              </tr>
            ) : scans.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                  No scans found. Click "INITIATE NEW SCAN" to start.
                </td>
              </tr>
            ) : (
              scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5 font-mono text-xs text-[#00f2fe]">{scan.id}</td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{scan.provider}</span>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-400">{formatTimestamp(scan.started_at)}</td>
                  <td className="px-6 py-5 text-center font-bold text-sm">{scan.total_resources || 0}</td>
                  <td className="px-6 py-5 text-center font-bold text-sm">{scan.total_risks || 0}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {scan.status === 'running' ? (
                         <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" />
                      ) : scan.status === 'completed' ? (
                         <CheckCircle2 className="w-3 h-3 text-green-400" />
                      ) : (
                         <XCircle className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-[10px] font-bold rounded-full ${
                        scan.status === 'completed' ? 'text-green-400' : 
                        scan.status === 'running' ? 'text-cyan-400' : 
                        'text-red-500'
                      }`}>
                        {scan.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scans;

import React, { useState } from 'react';
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

const Scans = () => {
  const [scans] = useState([
    { id: "SCAN-A02", provider: "AWS", timestamp: "Today, 10:30 AM", risks: 12, status: "Completed" },
    { id: "SCAN-B91", provider: "Azure", timestamp: "Today, 09:15 AM", risks: 4, status: "Completed" },
    { id: "SCAN-C99", provider: "AWS", timestamp: "In Progress", risks: "-", status: "Running" },
    { id: "SCAN-D12", provider: "Azure", timestamp: "Yesterday, 11:45 PM", risks: 0, status: "Completed" },
    { id: "SCAN-E05", provider: "AWS", timestamp: "Yesterday, 06:20 PM", risks: 2, status: "Failed" }
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Scan Orchestration</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track security discovery jobs across your cloud fleet.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 font-bold transition-all">
              <History size={18} />
              SCAN LOGS
           </button>
           <button className="flex items-center gap-2 bg-[#00f2fe] hover:bg-[#4facfe] text-black px-6 py-2.5 rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(0,242,254,0.3)]">
              <Play size={18} fill="black" />
              INITIATE NEW SCAN
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-card p-6 border-b-4 border-b-[#00f2fe]">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">Total Scans Run</p>
            <h3 className="text-2xl font-bold">142</h3>
         </div>
         <div className="glass-card p-6 border-b-4 border-b-green-500">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">Clean Pass Rate</p>
            <h3 className="text-2xl font-bold">92.4%</h3>
         </div>
         <div className="glass-card p-6 border-b-4 border-b-red-500">
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-2">Critical Failures</p>
            <h3 className="text-2xl font-bold">3</h3>
         </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Scan ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Provider</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Risks detected</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5 font-mono text-xs text-[#00f2fe]">{scan.id}</td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{scan.provider}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-400">{scan.timestamp}</td>
                <td className="px-6 py-5 text-center font-bold text-sm">{scan.risks}</td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {scan.status === 'Running' ? (
                       <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" />
                    ) : scan.status === 'Completed' ? (
                       <CheckCircle2 className="w-3 h-3 text-green-400" />
                    ) : (
                       <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-[10px] font-bold rounded-full ${
                      scan.status === 'Completed' ? 'text-green-400' : 
                      scan.status === 'Running' ? 'text-cyan-400' : 
                      'text-red-500'
                    }`}>
                      {scan.status.toUpperCase()}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scans;

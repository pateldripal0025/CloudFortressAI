import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Download, 
  AlertCircle, 
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const Risks = () => {
  const [risks] = useState([
    {
      id: "R-8291",
      resource: "finance-prod-db",
      provider: "AWS",
      issue: "Publicly Accessible RDS Instance",
      severity: "Critical",
      score: 94.5,
      recommendation: "Restrict inbound traffic to VPC CIDR only."
    },
    {
      id: "R-7210",
      resource: "storage-account-alpha",
      provider: "Azure",
      issue: "Public Storage Container Exposure",
      severity: "High",
      score: 82.0,
      recommendation: "Disable public access level for the container."
    },
    {
      id: "R-1102",
      resource: "web-server-sg",
      provider: "AWS",
      issue: "Port 22 Open to 0.0.0.0/0",
      severity: "Medium",
      score: 55.0,
      recommendation: "Restrict SSH access to specified VPN IPs."
    }
  ]);

  const getSeverityStyle = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-500 border-green-500/30';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Security Risks</h2>
        <p className="text-gray-500 text-sm mt-1">Detailed inventory of detected misconfigurations and AI remediation paths.</p>
      </div>

      <div className="glass-card p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search risks..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-sm font-medium">
            <Filter size={16} />
            Filters
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Resource / Issue</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Provider</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Severity</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">AI Score</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">AI Recommendation</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {risks.map((risk) => (
              <tr key={risk.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white group-hover:text-[#00f2fe] transition-colors">{risk.issue}</span>
                    <span className="text-[10px] text-gray-500 mt-1 font-mono">{risk.resource}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${risk.provider === 'AWS' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    {risk.provider}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getSeverityStyle(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold">{risk.score}</span>
                    <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#00f2fe]" style={{ width: `${risk.score}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs text-gray-400 italic max-w-xs line-clamp-2">
                    {risk.recommendation}
                  </p>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white">
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Risks;

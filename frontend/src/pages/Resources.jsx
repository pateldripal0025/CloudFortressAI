import React, { useState } from 'react';
import { 
  Database, 
  Globe, 
  Lock, 
  Server, 
  Shield, 
  Tag, 
  Search,
  Cloud
} from 'lucide-react';

const Resources = () => {
  const [resources] = useState([
    { name: "prod-web-server-01", type: "Virtual Machine", provider: "AWS", region: "us-east-1", status: "Risk Detected" },
    { name: "finance-vault-s3", type: "Storage Account", provider: "AWS", region: "us-west-2", status: "Secure" },
    { name: "azure-sql-main", type: "SQL Database", provider: "Azure", region: "West Europe", status: "Risk Detected" },
    { name: "global-dns-zone", type: "Network Resource", provider: "Azure", region: "Global", status: "Secure" },
    { name: "iam-admin-role", type: "Identity Role", provider: "AWS", region: "Global", status: "Review Required" }
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cloud Resources</h2>
          <p className="text-gray-500 text-sm mt-1">Complete inventory of discovered assets across multi-cloud environments.</p>
        </div>
        <div className="flex gap-4">
           <div className="glass-card px-4 py-2 flex items-center gap-2 border-blue-500/30">
              <Cloud size={16} className="text-blue-400" />
              <span className="text-sm font-bold">AWS: 842</span>
           </div>
           <div className="glass-card px-4 py-2 flex items-center gap-2 border-cyan-500/30">
              <Cloud size={16} className="text-cyan-400" />
              <span className="text-sm font-bold">Azure: 442</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Resource Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Provider</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Region</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {resources.map((res, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                         {res.type.includes('Virtual') ? <Server size={14} /> : res.type.includes('Storage') ? <Database size={14} /> : <Tag size={14} />}
                      </div>
                      <span className="font-medium text-sm">{res.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-400">{res.type}</td>
                  <td className="px-6 py-5">
                     <span className="text-xs font-bold">{res.provider}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">{res.region}</td>
                  <td className="px-6 py-5 text-right">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      res.status === 'Secure' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      res.status === 'Risk Detected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Resources;

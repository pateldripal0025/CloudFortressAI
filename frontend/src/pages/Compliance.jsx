import React from 'react';
import { 
  FileCheck, 
  ShieldCheck, 
  Award, 
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';

const FrameworkCard = ({ name, score, description, status }) => (
  <div className="glass-card p-8">
     <div className="flex justify-between items-start mb-6">
        <div>
           <h4 className="text-xl font-bold">{name}</h4>
           <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${status === 'Compliant' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
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
                    <Cell fill="#00f2fe" />
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
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Identity Management (92%)</span>
           </div>
           <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Encryption at Rest (100%)</span>
           </div>
           <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span>Logging & Monitoring (64%)</span>
           </div>
        </div>
     </div>
  </div>
);

const Compliance = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Frameworks</h2>
          <p className="text-gray-500 text-sm mt-1">Audit your multi-cloud environment against global regulatory standards.</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 font-bold transition-all">
           < Award size={18} />
           GENERATE AUDIT REPORT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <FrameworkCard 
            name="SOC2 Type II" 
            score={88} 
            description="Security, Confidentiality, and Availability controls."
            status="Compliant"
         />
         <FrameworkCard 
            name="ISO 27001" 
            score={74} 
            description="Information security management system standards."
            status="Action Required"
         />
         <FrameworkCard 
            name="CIS Benchmarks" 
            score={91} 
            description="Consensus-based best practices for secure configuration."
            status="Compliant"
         />
         <FrameworkCard 
            name="PCI DSS 4.0" 
            socre={62} 
            description="Payment card industry data security standard."
            status="Review Required"
         />
      </div>
    </div>
  );
};

export default Compliance;

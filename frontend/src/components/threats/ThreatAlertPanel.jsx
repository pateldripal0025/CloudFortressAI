import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ShieldAlert, Shield, Clock } from 'lucide-react';

const alerts = [
  {
    id: 1,
    title: "Public S3 bucket detected",
    resource: "prod-customer-data-bucket",
    time: "2 min ago",
    severity: "Critical",
  },
  {
    id: 2,
    title: "Open security group 0.0.0.0/0",
    resource: "sg-0abc1234def567890",
    time: "5 min ago",
    severity: "High",
  },
  {
    id: 3,
    title: "IAM policy overly permissive",
    resource: "DevTeamFullAccess",
    time: "8 min ago",
    severity: "Medium",
  }
];

const getSeverityStyles = (severity) => {
  switch(severity) {
    case 'Critical':
      return {
        badge: 'bg-red-500/20 text-red-500 border-red-500/30',
        icon: <ShieldAlert className="text-red-500" size={18} />,
        border: 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
      };
    case 'High':
      return {
        badge: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
        icon: <AlertCircle className="text-orange-500" size={18} />,
        border: 'border-slate-700/50 hover:border-orange-500/30'
      };
    case 'Medium':
      return {
        badge: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
        icon: <Shield className="text-yellow-500" size={18} />,
        border: 'border-slate-700/50 hover:border-yellow-500/30'
      };
    case 'Low':
      return {
        badge: 'bg-green-500/20 text-green-500 border-green-500/30',
        icon: <Shield className="text-green-500" size={18} />,
        border: 'border-slate-700/50 hover:border-green-500/30'
      };
    default:
      return {
        badge: 'bg-slate-500/20 text-slate-500 border-slate-500/30',
        icon: <AlertCircle className="text-slate-500" size={18} />,
        border: 'border-slate-700/50'
      };
  }
};

const ThreatAlertPanel = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-xl p-6 shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
             <ShieldAlert size={20} />
             Active Threat Alerts
           </h3>
           <p className="text-slate-400 text-xs mt-1">Real-time critical infrastructure warnings</p>
        </div>
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-500 tracking-wider">3 ACTIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);
          
          return (
            <div 
              key={alert.id}
              className={`flex items-start md:items-center justify-between p-4 rounded-lg bg-slate-950/50 border transition-all duration-300 ${styles.border} flex-col md:flex-row gap-4`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/50">
                   {styles.icon}
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                      {alert.resource}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {alert.time}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`px-2.5 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${styles.badge}`}>
                {alert.severity}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ThreatAlertPanel;

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Globe, 
  Component, 
  Database, 
  Zap, 
  FileCheck, 
  Settings, 
  FileText,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MapCard = ({ to, icon: Icon, title, description, color }) => (
  <Link to={to} className="group relative">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:bg-white/10" />
    <div className={`absolute inset-x-0 bottom-0 h-1 rounded-b-3xl ${color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} />
    
    <div className="relative p-8 flex flex-col h-full border border-white/5 rounded-3xl overflow-hidden">
      <div className="cyber-glow opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors group-hover:translate-x-1" />
      </div>
      
      <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase">{title}</h3>
      <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 group-hover:text-slate-400 transition-colors uppercase tracking-widest">{description}</p>
      
      <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-colors">
        <span>Initialize Protocol</span>
        <div className="h-[1px] flex-1 bg-slate-800" />
      </div>
    </div>
  </Link>
);

const Sitemap = () => {
  const pages = [
    { to: "/dashboard", icon: LayoutDashboard, title: "Mission Control", description: "Primary strategic oversight and real-time finding aggregates.", color: "text-cyan-400" },
    { to: "/threat-surface", icon: Globe, title: "Threat Surface", description: "High-fidelity mapping of global exposure and hazard heatmaps.", color: "text-rose-500" },
    { to: "/resource-sphere", icon: Component, title: "Resource Sphere", description: "Force-directed graph of infrastructure connectivity and criticality.", color: "text-blue-400" },
    { to: "/resources", icon: Database, title: "Asset Registry", description: "Comprehensive inventory of discovered cloud resources across all providers.", color: "text-indigo-400" },
    { to: "/scans", icon: Zap, title: "Vector Scans", description: "Initialize and monitor deep-infrastructure security assessments.", color: "text-amber-500" },
    { to: "/compliance", icon: FileCheck, title: "Regulatory Audit", description: "Benchmarked posture analysis against SOC2, HIPAA, and GDPR standards.", color: "text-emerald-400" },
    { to: "/reports", icon: FileText, title: "Intelligence Reports", description: "Serialized security audits and tactical findings exported for stakeholders.", color: "text-purple-400" },
    { to: "/risk", icon: ShieldAlert, title: "Risk Profile", description: "Deep-dive analysis of specific vulnerability vectors and fixes.", color: "text-orange-500" },
    { to: "/settings", icon: Settings, title: "Neural Config", description: "Advanced platform orchestration and synchronization parameters.", color: "text-slate-400" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 lg:p-12 max-w-7xl mx-auto"
    >
      <div className="mb-16">
        <div className="flex items-center gap-3 text-cyan-500 mb-4 animate-pulse">
           <div className="w-2 h-2 rounded-full bg-current" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Command Hierarchy Engaged</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">COMMAND<span className="text-cyan-500">MAP</span></h1>
        <p className="text-slate-500 text-sm font-black uppercase tracking-widest max-w-xl leading-relaxed">
          The centralized tactical directory for the CloudFortress AI ecosystem. Navigate between high-fidelity oversight modules and synchronized telemetry sectors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {pages.map((page, i) => (
          <motion.div
            key={page.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <MapCard {...page} />
          </motion.div>
        ))}
      </div>

      <footer className="mt-24 pt-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">Neural Link Status: Synchronized // Port 5001 Active</p>
      </footer>
    </motion.div>
  );
};

export default Sitemap;

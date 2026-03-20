import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Database, 
  Zap, 
  FileCheck, 
  Settings, 
  ShieldCheck,
  X,
  Globe,
  Component,
  Map
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink 
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative
      ${isActive 
        ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
        : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}
    `}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div 
            layoutId="activeSide"
            className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          />
        )}
        <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'group-hover:scale-110'}`} />
        <span className="tracking-tight">{label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useApp();

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-slate-950 border-r border-white/5 
        transform transition-transform duration-500 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
                <ShieldCheck className="text-slate-950 w-6 h-6 -rotate-3" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white">
                FORTRESS<span className="text-cyan-500">AI</span>
              </h1>
            </div>
            <button 
              onClick={closeSidebar}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2.5 flex-1">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
            <SidebarItem to="/threat-surface" icon={Globe} label="Threat Surface" onClick={closeSidebar} />


            <SidebarItem to="/resource-sphere" icon={Component} label="Resource Sphere" onClick={closeSidebar} />
            <SidebarItem to="/resources" icon={Database} label="Resources" onClick={closeSidebar} />
            <SidebarItem to="/scans" icon={Zap} label="Scans" onClick={closeSidebar} />
            <SidebarItem to="/compliance" icon={FileCheck} label="Compliance" onClick={closeSidebar} />
            <SidebarItem to="/settings" icon={Settings} label="Settings" onClick={closeSidebar} />
            <div className="pt-4 mt-4 border-t border-white/5">
              <SidebarItem to="/sitemap" icon={Map} label="Command Map" onClick={closeSidebar} />
            </div>
          </nav>


          <footer className="mt-auto pt-8 border-t border-white/5">
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-xs font-black text-white shadow-lg">CF</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Security Node</p>
                <p className="text-[10px] text-slate-500 font-bold">Admin Alpha</p>
              </div>
            </div>
          </footer>
        </div>
      </aside>
    </>
  );
};


export default Sidebar;


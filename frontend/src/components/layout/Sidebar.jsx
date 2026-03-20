import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Database, 
  Zap, 
  FileCheck, 
  Settings, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
      ${isActive 
        ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-l-4 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.1)]' 
        : 'text-[#94a3b8] hover:bg-white/5 hover:text-white'}
    `}
  >
    {({ isActive }) => (
      <>
        <Icon className={`w-5 h-5 group-hover:scale-110 transition-transform ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]' : ''}`} />
        <span className="font-semibold tracking-wide">{label}</span>
        {label === "Risks" && (
          <span className="ml-auto bg-[#FF4D4F]/20 text-[#FF4D4F] text-[9px] px-2 py-0.5 rounded-full border border-[#FF4D4F]/30 font-bold uppercase">
            AI
          </span>
        )}
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  return (
    <div className="w-64 h-screen border-r border-white/5 bg-[#0b0f19]/90 backdrop-blur-3xl flex flex-col p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 px-2 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-[#00E5FF] to-[#4facfe] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
          <ShieldCheck className="text-black w-6 h-6" />
        </div>
        <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">
          FORTRESS<span className="text-[#00E5FF]">AI</span>
        </h1>
      </div>

      <nav className="space-y-2 flex-1">
        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem to="/risks" icon={ShieldAlert} label="Risks" />
        <SidebarItem to="/resources" icon={Database} label="Resources" />
        <SidebarItem to="/scans" icon={Zap} label="Scans" />
        <SidebarItem to="/compliance" icon={FileCheck} label="Compliance" />
        <SidebarItem to="/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="mt-auto p-4 glass-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs">JD</div>
          <div>
            <p className="text-xs font-bold">John Doe</p>
            <p className="text-[10px] text-gray-500">Security Lead</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

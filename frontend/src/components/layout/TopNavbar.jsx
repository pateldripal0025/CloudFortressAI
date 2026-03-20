import { Bell, Search, Globe, ChevronDown, Activity } from 'lucide-react';

const TopNavbar = () => {
  return (
    <header className="h-20 border-b border-white/5 bg-[#0b0f19]/60 backdrop-blur-2xl flex items-center justify-between px-10 sticky top-0 z-40 ml-64">
      <div className="flex items-center gap-4 bg-[#111827]/80 px-5 py-2.5 rounded-2xl border border-white/5 w-[450px] shadow-inner">
        <Search className="w-4 h-4 text-[#94a3b8]" />
        <input 
          type="text" 
          placeholder="Global intelligence search..." 
          className="bg-transparent border-none outline-none text-xs w-full text-gray-200 placeholder:text-gray-500 font-medium"
        />
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
          Ctrl K
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-black tracking-widest uppercase">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          System Operational
        </div>
        
        <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
          <Bell className="w-5 h-5 text-[#94a3b8] group-hover:text-[#00E5FF] transition-colors" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF4D4F] rounded-full border-2 border-[#0b0f19] shadow-[0_0_10px_rgba(255,77,79,0.5)]"></span>
        </button>

        <div className="h-10 w-px bg-white/5"></div>

        <button className="flex items-center gap-2 hover:bg-white/5 p-2 rounded-xl transition-colors">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Environment</p>
            <p className="text-sm font-medium">Production</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;

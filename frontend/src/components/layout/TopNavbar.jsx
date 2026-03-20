import { Activity, Menu } from 'lucide-react';
import GlobalSearch from '../ui/GlobalSearch';
import EnvironmentSwitch from '../ui/EnvironmentSwitch';
import NotificationDropdown from '../ui/NotificationDropdown';
import { useApp } from '../../context/AppContext';

const TopNavbar = () => {
  const { toggleSidebar } = useApp();

  return (
    <header className="h-20 border-b border-white/5 bg-[#0b0f19]/60 backdrop-blur-2xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 lg:ml-72 transition-all duration-500">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3 md:gap-8">
        <div className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black tracking-widest uppercase">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          System Operational
        </div>
        
        <NotificationDropdown />

        <div className="h-8 w-px bg-white/5 hidden md:block"></div>

        <EnvironmentSwitch />
      </div>
    </header>
  );
};



export default TopNavbar;

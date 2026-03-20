import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check, Cloud, Database, HardDrive } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const environments = [
  { id: 'production', label: 'Production', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'staging', label: 'Staging', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'development', label: 'Development', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
];

const EnvironmentSwitch = () => {
  const { environment, updateEnvironment } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentEnv = environments.find(e => e.id === environment) || environments[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 px-4 py-2.5 rounded-2xl transition-all duration-300 group"
      >
        <div className={`p-1.5 rounded-lg ${currentEnv.bg} ${currentEnv.color} border ${currentEnv.border}`}>
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden md:block min-w-[100px]">
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">System Zone</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-200">{currentEnv.label}</span>
            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-64 bg-[#0d111c] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl">
          <div className="p-3 mb-2">
            <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-500">Switch Infrastructure Environment</h3>
            <p className="text-[10px] text-gray-600 mt-1 italic">Selecting a new zone will re-sync active compliance data</p>
          </div>
          
          <div className="space-y-1">
            {environments.map(env => (
              <button
                key={env.id}
                onClick={() => {
                  updateEnvironment(env.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left group ${
                  environment === env.id ? 'bg-white/5' : ''
                }`}
              >
                <div className={`p-2 rounded-lg border transition-all ${
                  environment === env.id ? `${env.bg} ${env.color} ${env.border}` : 'bg-white/5 text-gray-500 border-white/5 group-hover:bg-white/10'
                }`}>
                  {env.id === 'production' ? <Cloud size={14} /> : env.id === 'staging' ? <Database size={14} /> : <HardDrive size={14} />}
                </div>
                <div className="flex-1">
                  <span className={`text-xs font-bold leading-none ${
                    environment === env.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                  }`}>{env.label}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${env.id === 'production' ? 'bg-red-500' : env.id === 'staging' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">{env.id} zone active</span>
                  </div>
                </div>
                {environment === env.id && <Check className="w-3.5 h-3.5 text-[#00E5FF]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentSwitch;

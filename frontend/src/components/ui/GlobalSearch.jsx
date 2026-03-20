import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, AlertCircle, Server, Activity, ShieldAlert, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { riskService } from '../../services/api';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setIsOpen(true);
      const res = await riskService.globalSearch(query);
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type, id) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'risk') navigate(`/risks`); // Or specific risk page if implemented
    else if (type === 'resource') navigate(`/resources`);
  };

  const Highlight = ({ text, highlight }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="text-[#00E5FF] font-bold bg-[#00E5FF]/10 px-0.5 rounded">{part}</span> : part
        )}
      </span>
    );
  };

  return (
    <div className="relative w-[450px]" ref={searchRef}>
      <div className={`flex items-center gap-4 px-5 py-2.5 rounded-2xl border transition-all duration-300 shadow-inner ${isOpen ? 'bg-[#111827] border-[#00E5FF]/30 ring-2 ring-[#00E5FF]/10' : 'bg-[#111827]/80 border-white/5'}`}>
        {loading ? <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" /> : <Search className="w-4 h-4 text-[#94a3b8]" />}
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Global intelligence search..." 
          className="bg-transparent border-none outline-none text-xs w-full text-gray-200 placeholder:text-gray-500 font-medium"
        />
        {!loading && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            Ctrl K
          </div>
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full mt-3 w-full bg-[#0d111c] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-3xl overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* Risks Section */}
            {results.risks?.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-black text-gray-500 flex items-center justify-between">
                  <span>Detected Risks</span>
                  <span className="bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">{results.risks.length}</span>
                </div>
                {results.risks.map(risk => (
                  <button 
                    key={risk._id}
                    onClick={() => handleSelect('risk', risk._id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-left group"
                  >
                    <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500">
                      <ShieldAlert size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-200 group-hover:text-[#00E5FF] transition-colors"><Highlight text={risk.title} highlight={query} /></div>
                      <div className="text-[10px] text-gray-500 truncate">{risk.resource}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {/* Resources Section */}
            {results.resources?.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-black text-gray-500 flex items-center justify-between">
                  <span>Cloud Resources</span>
                  <span className="bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20">{results.resources.length}</span>
                </div>
                {results.resources.map(res => (
                  <button 
                    key={res._id}
                    onClick={() => handleSelect('resource', res._id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-left group"
                  >
                    <div className="p-2 bg-[#00E5FF]/10 rounded-lg border border-[#00E5FF]/20 text-[#00E5FF]">
                      <Server size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-200 group-hover:text-[#00E5FF] transition-colors"><Highlight text={res.name} highlight={query} /></div>
                      <div className="text-[10px] text-gray-500">{res.type} • {res.provider}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {/* Scans Section */}
            {results.scans?.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-black text-gray-500 flex items-center justify-between">
                  <span>Infrastructure Scans</span>
                  <span className="bg-[#22C55E]/10 text-[#22C55E] px-1.5 py-0.5 rounded border border-[#22C55E]/20">{results.scans.length}</span>
                </div>
                {results.scans.map(scan => (
                  <button 
                    key={scan._id}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors text-left group"
                  >
                    <div className="p-2 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/20 text-[#22C55E]">
                      <Activity size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-200 group-hover:text-[#22C55E] transition-colors"><Highlight text={scan.title} highlight={query} /></div>
                      <div className="text-[10px] text-gray-500">{scan.status} • Recent execution</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {Object.values(results).every(arr => arr.length === 0) && (
              <div className="p-12 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-gray-600 mx-auto opacity-50" />
                <p className="text-xs text-gray-500 font-medium">Intelligence database returned 0 results for <span className="text-white italic">"{query}"</span></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

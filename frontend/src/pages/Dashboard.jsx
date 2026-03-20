import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Database,
  AlertTriangle,
  ShieldAlert,
  Rocket,
  Zap,
  RefreshCw,
  Activity,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Cpu,
  Target,
  BarChart as BarChartIcon
} from 'lucide-react';

import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';

import LiveAlerts from '../components/threats/LiveAlerts';
import CyberButton from '../components/ui/CyberButton';
import StatusBadge from '../components/ui/StatusBadge';

import RiskSeverityChart from '../components/analytics/RiskSeverityChart';
import ResourceDistributionChart from '../components/analytics/ResourceDistributionChart';
import RiskTrendChart from '../components/analytics/RiskTrendChart';
import RiskDistributionCurve from '../components/analytics/RiskDistributionCurve';
import ResourceOverview from '../components/analytics/ResourceOverview';

import { dashboardService, scanService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [newAlert, setNewAlert] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [showScanSuccess, setShowScanSuccess] = useState(false);
  const [aiInsights, setAIInsights] = useState([]);

  const fetchAIInsights = useCallback(async () => {
    try {
      const res = await dashboardService.getAIPriorityInsights();
      if (res && res.success) setAIInsights(res.data);
    } catch (err) {
      console.error('AI Insights error:', err);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getSummary();
      if (res && res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchAIInsights();
    const interval = setInterval(() => {
      fetchSummary();
      fetchAIInsights();
    }, 30000); 
    return () => clearInterval(interval);
  }, [fetchSummary, fetchAIInsights]);


  const handleAlert = useCallback((alert) => {
    setNewAlert(alert);
    if (alert.type === 'assets_discovered' || alert.type === 'scan_completed') {
       fetchSummary();
    }
  }, [fetchSummary]);

  const handleExecuteScan = async () => {
    const loadingToast = toast.loading('Initializing Neural Scan...');
    try {
      setIsScanning(true);
      setShowScanSuccess(false);
      
      const res = await scanService.startScan('Multi-Cloud');
      
      if (res && res.success) {
        toast.success('Vector analysis complete.', { id: loadingToast });
        setLastScanTime(new Date());
        setShowScanSuccess(true);
        fetchSummary();
        setNewAlert({ type: 'scan_completed', timestamp: new Date().toISOString() });
        setTimeout(() => setShowScanSuccess(false), 5000);
      }
    } catch (err) {
      toast.error('Scan failed to resolve.', { id: loadingToast });
    } finally {
      setIsScanning(false);
    }
  };


  const getTimeAgo = (date) => {
    if (!date) return null;
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'JUST NOW';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}M AGO`;
  };

  const navigate = useNavigate();

  // Dynamic Risk Score (example: inverse of security posture)
  const riskScore = useMemo(() => {
     if (!summary) return 68;
     const base = (summary.criticalRisks * 10) + (summary.highRisks * 5);
     return Math.min(95, Math.max(20, base));
  }, [summary]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 relative"
    >
      {/* Neural Noise Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none z-50" />

      <LiveAlerts onAlert={handleAlert} />

      {/* Hero Header: Autonomous Command Center */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-cyan-600/15 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] -ml-24 -mb-24" />
        
        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                <StatusBadge status="Neural Net Active" variant="cyan" className="!bg-cyan-400/10 !border-cyan-400/20 !px-3 !py-1 !text-[9px]" />
             </div>
             <div className="h-1 w-1 rounded-full bg-slate-800" />
             <StatusBadge status="System Safe" variant="emerald" className="!bg-emerald-400/10 !border-emerald-400/20 !px-3 !py-1 !text-[9px]" />
             <div className="h-4 w-[1px] bg-slate-800" />
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] font-mono">
               NODE-DET: {lastScanTime ? getTimeAgo(lastScanTime) : 'LISTENING'}
             </span>
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-white leading-[0.85] uppercase">
            Security <br />
            <span className="cyber-gradient-text !from-cyan-400 !to-blue-600 font-[Orbitron]">Command <br />Center</span>
          </h2>

          <div className="space-y-2 mt-4">
            {aiInsights && aiInsights.slice(0, 2).map((insight, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5"
              >
                <Zap size={14} className="text-[#00E5FF] animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{insight.title}:</span>
                <span className="text-[10px] text-[#00E5FF] font-black">{insight.confidence}% CONFIDENCE</span>
              </motion.div>
            ))}
          </div>




          
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] max-w-lg leading-loose opacity-80">
             Autonomous orchestration across <span className="text-white border-b border-white/20 pb-0.5">Hybrid-Cloud Environments</span>.
          </p>
        </div>

        
        <div className="relative z-10 flex flex-col md:items-end gap-10">
           <div className="text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Global Risk Index</div>
              <div className="flex items-center gap-4">
                 <span className="text-5xl font-black text-white tabular-nums" style={{ fontFamily: 'Orbitron, sans-serif' }}>{riskScore}</span>
                 <div className="w-32 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${riskScore}%` }}
                        className={`h-full ${riskScore > 70 ? 'bg-rose-500' : 'bg-cyan-400'} shadow-[0_0_15px_rgba(6,182,212,0.4)]`}
                    />
                 </div>
              </div>
           </div>

           <div className="flex gap-4">
              <CyberButton
                onClick={handleExecuteScan}
                disabled={isScanning}
                icon={isScanning ? RefreshCw : Zap}
                className="h-14 px-10 !rounded-2xl"
              >
                {isScanning ? 'Synchronizing...' : 'Execute Vector Scan'}
              </CyberButton>
           </div>
        </div>
      </div>

      {/* Enterprise Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: "Active Assets", value: summary?.discoveredAssets ?? 1542, icon: Cpu, color: "text-cyan-400", trend: "+12%" },
          { title: "Total Threats", value: summary?.totalFindings ?? 386, icon: ShieldAlert, color: "text-rose-500", trend: "-4%" },
          { title: "Neural Scans", value: summary?.scansRun ?? 248, icon: RefreshCw, color: "text-indigo-400", trend: "LIVE" },
          { title: "Postures Fixed", value: summary?.fixedIssues ?? 142, icon: ShieldCheck, color: "text-emerald-400", trend: "+18" }
        ].map((stat, i) => (

          <GlassCard key={i} className="p-8 border-white/5 group hover:border-white/10 transition-all duration-500">
             <div className="cyber-glow" />
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                        <stat.icon size={20} />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} border border-current opacity-60`}>
                        {stat.trend}
                    </span>
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.title}</div>
                <div className="text-3xl font-black text-white tabular-nums" style={{ fontFamily: 'Orbitron, sans-serif' }}>{stat.value}</div>
             </div>
          </GlassCard>
        ))}
      </div>

      {/* Resources & Distribution */}
      <ResourceOverview 
        stats={summary?.providerBreakdown} 
        typeData={summary?.typeBreakdown} 
      />


      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <GlassCard className="p-8 border-white/5">
            <h3 className="text-xl font-black text-white tracking-tight mb-8">Risk <span className="text-amber-500">Gradient</span></h3>
            <RiskDistributionCurve />
        </GlassCard>
        <RiskTrendChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        <RiskSeverityChart />
        <ResourceDistributionChart />
      </div>





    </motion.div>
  );
};

export default Dashboard;

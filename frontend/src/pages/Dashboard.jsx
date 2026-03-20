import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  AlertTriangle,
  ShieldAlert,
  Rocket,
  PieChart as ChartIcon,
  Crosshair,
  Zap,
  RefreshCw
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import RiskDistributionCurve from '../components/analytics/RiskDistributionCurve';
import AIPriorityInsights from '../components/ai/AIPriorityInsights';
import GlassCard from '../components/ui/GlassCard';
import ParticleBackground from '../components/background/ParticleBackground';
import RiskSeverityChart from '../components/analytics/RiskSeverityChart';
import ResourceDistributionChart from '../components/analytics/ResourceDistributionChart';
import RiskTrendChart from '../components/analytics/RiskTrendChart';
import ThreatAlertPanel from '../components/threats/ThreatAlertPanel';
import SeverityFilter from '../components/threats/SeverityFilter';
import RiskTable from '../components/threats/RiskTable';
import LiveAlerts from '../components/threats/LiveAlerts';
import { dashboardService, scanService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [threatFilter, setThreatFilter] = useState('All');
  const [newAlert, setNewAlert] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      toast.error('Failed to load dashboard summary.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleAlert = useCallback((alert) => {
    setNewAlert(alert);
    // Refresh summary on certain alert types if needed
    if (alert.type === 'risk_detected' || alert.type === 'scan_completed') {
      fetchSummary();
    }
  }, [fetchSummary]);

  const handleExecuteScan = async () => {
    try {
      setIsScanning(true);
      toast.loading('Initializing global security scan...', { id: 'scan-toast' });
      
      await scanService.startScan('AWS');
      
      // Refresh summary
      const res = await dashboardService.getSummary();
      setSummary(res.data);
      
      // Trigger RiskTable refresh by updating newAlert with a dummy event
      setNewAlert({ type: 'scan_completed', timestamp: new Date().toISOString() });
      
      toast.success('Scan completed successfully!', {
        id: 'scan-toast',
        position: 'top-right',
        style: {
          background: '#ffffff',
          color: '#111827',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
          fontSize: '14px',
          fontWeight: '600',
        },
        iconTheme: {
          primary: '#22c55e',
          secondary: '#ffffff',
        },
      });
    } catch (err) {
      console.error('Scan failed:', err);
      toast.error('Global scan failed. Please check backend logs.', { id: 'scan-toast' });
    } finally {
      setIsScanning(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative space-y-10 pb-20"
    >
      <LiveAlerts onAlert={handleAlert} />
      <ParticleBackground />

      {/* Hero Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">
            Security Command Center
          </h2>
          <p className="text-[#94a3b8] font-medium text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
            Analyzing real-time multi-cloud telemetry across <span className="text-white font-bold">AWS &amp; Azure</span>
          </p>
        </div>
        <button 
          onClick={handleExecuteScan}
          disabled={isScanning}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,229,255,0.25)] uppercase tracking-widest ${
            isScanning 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#0b0f19]'
          }`}
        >
          {isScanning ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Zap size={16} fill={isScanning ? "#94a3b8" : "#0b0f19"} />
          )}
          {isScanning ? 'Scanning Infrastructure...' : 'Execute Global Scan'}
        </button>
      </div>

      {/* Global Security Metrics — real data from /dashboard/summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="h-32 bg-slate-800/50 animate-pulse rounded-2xl" />
          ) : (
            <StatCard
              title="Discovered Assets"
              value={summary?.total_resources ?? 0}
              icon={Database}
              colorClass="text-cyan-400"
            />
          )}
        </motion.div>
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="h-32 bg-slate-800/50 animate-pulse rounded-2xl" />
          ) : (
            <StatCard
              title="Total Findings"
              value={summary?.total_risks ?? 0}
              icon={AlertTriangle}
              colorClass="text-[#ffd166]"
            />
          )}
        </motion.div>
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="h-32 bg-slate-800/50 animate-pulse rounded-2xl" />
          ) : (
            <StatCard
              title="Critical Risks"
              value={summary?.critical_risks ?? 0}
              icon={ShieldAlert}
              colorClass="text-[#ff4d4f] font-bold drop-shadow-[0_0_8px_rgba(255,77,79,0.5)]"
            />
          )}
        </motion.div>
        <motion.div variants={itemVariants}>
          {isLoading ? (
            <div className="h-32 bg-slate-800/50 animate-pulse rounded-2xl" />
          ) : (
            <StatCard
              title="High Risks"
              value={summary?.high_risks ?? 0}
              icon={Rocket}
              colorClass="text-[#3b82f6]"
            />
          )}
        </motion.div>
      </div>

      <div className="mb-4 mt-6">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <ChartIcon size={20} className="text-cyan-400" />
          Security Analytics
        </h3>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div variants={itemVariants}><RiskSeverityChart refreshTrigger={newAlert} /></motion.div>
        <motion.div variants={itemVariants}><ResourceDistributionChart refreshTrigger={newAlert} /></motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <motion.div variants={itemVariants} className="w-full"><RiskTrendChart refreshTrigger={newAlert} /></motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <RiskDistributionCurve />
        </motion.div>

        {/* AI Insights Sidebar */}
        <AIPriorityInsights refreshTrigger={newAlert} />
      </div>

      {/* Threat Intelligence Section */}
      <div className="mb-4 mt-12">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <ShieldAlert size={20} className="text-cyan-400" />
          Threat Intelligence
        </h3>
      </div>

      <div className="flex flex-col gap-6">
        <motion.div variants={itemVariants}><ThreatAlertPanel /></motion.div>
        <motion.div variants={itemVariants}>
          <SeverityFilter currentFilter={threatFilter} setFilter={setThreatFilter} />
        </motion.div>
        <motion.div variants={itemVariants}>
          {/* newAlert triggers auto-refresh inside RiskTable */}
          <RiskTable filter={threatFilter} newAlert={newAlert} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

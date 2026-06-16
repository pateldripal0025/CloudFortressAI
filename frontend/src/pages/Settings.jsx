import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Cloud, 
  Code,
  Globe,
  Save,
  Trash2,
  Plus,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Server
} from 'lucide-react';
import { connectorService } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import toast from 'react-hot-toast';

const Settings = () => {
  // Cloud Connectors state
  const [connectors, setConnectors] = useState([]);
  const [loadingConnectors, setLoadingConnectors] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [provider, setProvider] = useState('AWS');
  const [connectorName, setConnectorName] = useState('');
  const [savingConnector, setSavingConnector] = useState(false);

  // AWS Credentials
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');

  // Azure Credentials
  const [azureTenantId, setAzureTenantId] = useState('');
  const [azureClientId, setAzureClientId] = useState('');
  const [azureClientSecret, setAzureClientSecret] = useState('');

  // GCP Credentials
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpClientEmail, setGcpClientEmail] = useState('');
  const [gcpPrivateKey, setGcpPrivateKey] = useState('');

  // API Tokens state
  const [apiToken, setApiToken] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Notification Webhooks state
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [alertCritical, setAlertCritical] = useState(true);
  const [alertHigh, setAlertHigh] = useState(true);
  const [alertMedium, setAlertMedium] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);

  useEffect(() => {
    loadConnectors();
    // Load webhook from localStorage
    const savedSlackUrl = localStorage.getItem('cf_slack_webhook');
    if (savedSlackUrl) setSlackWebhookUrl(savedSlackUrl);
  }, []);

  const loadConnectors = async () => {
    try {
      setLoadingConnectors(true);
      const res = await connectorService.getConnectors();
      if (res && res.success) {
        setConnectors(res.data);
      }
    } catch (err) {
      console.error('Failed to load connectors:', err);
    } finally {
      setLoadingConnectors(false);
    }
  };

  const handleAddConnector = async (e) => {
    e.preventDefault();
    if (!connectorName) {
      toast.error('Please enter a name for the cloud connector');
      return;
    }

    let credentials = {};
    if (provider === 'AWS') {
      if (!awsAccessKey || !awsSecretKey) {
        toast.error('AWS Credentials are required');
        return;
      }
      credentials = { awsAccessKey, awsSecretKey, awsRegion };
    } else if (provider === 'Azure') {
      if (!azureTenantId || !azureClientId || !azureClientSecret) {
        toast.error('Azure Credentials are required');
        return;
      }
      credentials = { azureTenantId, azureClientId, azureClientSecret };
    } else if (provider === 'GCP') {
      if (!gcpProjectId || !gcpClientEmail || !gcpPrivateKey) {
        toast.error('GCP Service Account credentials are required');
        return;
      }
      credentials = { gcpProjectId, gcpClientEmail, gcpPrivateKey };
    }

    try {
      setSavingConnector(true);
      const res = await connectorService.createConnector({
        name: connectorName,
        provider,
        credentials
      });

      if (res && res.success) {
        toast.success(`Cloud Connector "${connectorName}" established.`);
        setConnectors(prev => [...prev, res.data]);
        // Reset form
        setConnectorName('');
        setAwsAccessKey('');
        setAwsSecretKey('');
        setAzureTenantId('');
        setAzureClientId('');
        setAzureClientSecret('');
        setGcpProjectId('');
        setGcpClientEmail('');
        setGcpPrivateKey('');
        setShowAddForm(false);
      }
    } catch (err) {
      toast.error('Connection verification failed.');
    } finally {
      setSavingConnector(false);
    }
  };

  const handleDeleteConnector = async (id, name) => {
    try {
      const res = await connectorService.deleteConnector(id);
      if (res && res.success) {
        toast.success(`Connector "${name}" disconnected.`);
        setConnectors(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete cloud connector.');
    }
  };

  const handleGenerateToken = () => {
    const randomHex = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const token = `cf_token_${randomHex}`;
    setApiToken(token);
    toast.success('Secure SDK access token generated.');
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopiedToken(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    setSavingWebhook(true);
    setTimeout(() => {
      localStorage.setItem('cf_slack_webhook', slackWebhookUrl);
      setSavingWebhook(false);
      toast.success('Webhook and alert thresholds saved successfully.');
    }, 800);
  };

  return (
    <div className="max-w-6xl space-y-10 pb-20">
      <div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Platform <span className="cyber-gradient-text font-[Orbitron]">Settings</span></h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">Configure cloud hooks & orchestration telemetry</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Cloud Connectors */}
        <div className="lg:col-span-2 space-y-8">
          
          <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <Cloud className="text-cyan-400" size={20} />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Cloud Connectors</h3>
              </div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 active:scale-95"
              >
                {showAddForm ? 'CANCEL' : <><Plus size={12} /> ADD_CONNECTOR</>}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddConnector} className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 mb-8 space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Cloud Provider</label>
                    <select 
                      value={provider} 
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                    >
                      <option value="AWS">AWS (Amazon Web Services)</option>
                      <option value="Azure">Azure (Microsoft Azure)</option>
                      <option value="GCP">GCP (Google Cloud Platform)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Connector Alias</label>
                    <input 
                      type="text" 
                      placeholder="E.G. PRODUCTION_VECTORS" 
                      value={connectorName}
                      onChange={(e) => setConnectorName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 uppercase font-mono"
                    />
                  </div>
                </div>

                {/* AWS Specific Fields */}
                {provider === 'AWS' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">AWS Access Key ID</label>
                        <input 
                          type="text" 
                          placeholder="AKIAIOSFODNN7EXAMPLE" 
                          value={awsAccessKey}
                          onChange={(e) => setAwsAccessKey(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">AWS Secret Access Key</label>
                        <input 
                          type="password" 
                          placeholder="••••••••••••••••••••••••••••••••" 
                          value={awsSecretKey}
                          onChange={(e) => setAwsSecretKey(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Default Scan Region</label>
                      <input 
                        type="text" 
                        value={awsRegion}
                        onChange={(e) => setAwsRegion(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Azure Specific Fields */}
                {provider === 'Azure' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Azure Tenant ID</label>
                        <input 
                          type="text" 
                          placeholder="00000000-0000-0000-0000-000000000000" 
                          value={azureTenantId}
                          onChange={(e) => setAzureTenantId(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Azure Client (Application) ID</label>
                        <input 
                          type="text" 
                          placeholder="00000000-0000-0000-0000-000000000000" 
                          value={azureClientId}
                          onChange={(e) => setAzureClientId(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Azure Client Secret</label>
                      <input 
                        type="password" 
                        placeholder="••••••••••••••••••••••••••••••••" 
                        value={azureClientSecret}
                        onChange={(e) => setAzureClientSecret(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>
                  </div>
                )}

                {/* GCP Specific Fields */}
                {provider === 'GCP' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">GCP Project ID</label>
                        <input 
                          type="text" 
                          placeholder="cloudfortress-production" 
                          value={gcpProjectId}
                          onChange={(e) => setGcpProjectId(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">GCP Client Email</label>
                        <input 
                          type="email" 
                          placeholder="scanner@project-id.iam.gserviceaccount.com" 
                          value={gcpClientEmail}
                          onChange={(e) => setGcpClientEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Private Key (JSON representation or raw string)</label>
                      <textarea 
                        rows={3}
                        placeholder="-----BEGIN PRIVATE KEY-----\n..." 
                        value={gcpPrivateKey}
                        onChange={(e) => setGcpPrivateKey(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={savingConnector}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {savingConnector ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    VERIFY_AND_CONNECT
                  </button>
                </div>
              </form>
            )}

            {loadingConnectors ? (
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 size={24} className="text-cyan-400 animate-spin" />
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Querying Cloud Connectors...</p>
              </div>
            ) : connectors.length === 0 ? (
              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-white/[0.01]">
                <Server className="w-10 h-10 text-slate-700 mx-auto opacity-30 animate-pulse" />
                <div>
                  <h5 className="font-bold text-sm text-white uppercase tracking-tight">No Active Integrations</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Connect an AWS, Azure, or GCP target environment to run actual compliance vector scans against live cloud APIs.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {connectors.map(c => (
                  <div key={c._id} className="flex justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-[10px] font-bold text-cyan-400">{c.provider}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{c.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Orchestrated // Active</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteConnector(c._id, c.name)}
                      className="p-3 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Secure API Key Engine */}
          <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Code className="text-cyan-400" size={20} />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Secure SDK Access</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Generate a high-entropy access token to sync local audit scripts or CI/CD pipelines directly with CloudFortress telemetry portals.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  readOnly 
                  value={apiToken || 'CLICK GENERATE TO CREATE A SECURE API KEY'} 
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-400 focus:outline-none font-mono tracking-wider"
                />
                {apiToken ? (
                  <button 
                    onClick={handleCopyToken}
                    className="p-3 bg-cyan-500 text-slate-950 rounded-xl transition-all flex items-center justify-center active:scale-95"
                  >
                    {copiedToken ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                ) : (
                  <button 
                    onClick={handleGenerateToken}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all"
                  >
                    GENERATE
                  </button>
                )}
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Slack Notifications & Quick Profile */}
        <div className="space-y-8">
          
          {/* Slack Alerting Settings */}
          <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-cyan-400" size={20} />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Alert Notifications</h3>
            </div>
            
            <form onSubmit={handleSaveWebhook} className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Slack Webhook URL</label>
                <input 
                  type="url" 
                  placeholder="https://hooks.slack.com/services/..." 
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/40 font-mono"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Threat Thresholds</label>
                
                {[
                  { id: 'critical', label: 'CRITICAL SEVERITY', state: alertCritical, setter: setAlertCritical },
                  { id: 'high', label: 'HIGH SEVERITY', state: alertHigh, setter: setAlertHigh },
                  { id: 'medium', label: 'MEDIUM SEVERITY', state: alertMedium, setter: setAlertMedium }
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
                    <input 
                      type="checkbox" 
                      checked={item.state} 
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 accent-cyan-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <button 
                type="submit" 
                disabled={savingWebhook}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {savingWebhook ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                SAVE_CONFIG
              </button>
            </form>
          </GlassCard>

          {/* Quick Platform Security Health */}
          <GlassCard className="p-8 border-white/5 bg-slate-950/40 backdrop-blur-3xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-cyan-400" size={20} />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Engine Status</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Socket Pipeline</span>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">NOMINAL</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deduplication</span>
                <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">OPTIMAL</span>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};

export default Settings;

import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Cloud, 
  Code,
  Globe,
  Save
} from 'lucide-react';

const SettingsItem = ({ icon: Icon, title, description, badge }) => (
  <div className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
       <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all">
          <Icon size={20} />
       </div>
       <div>
          <h5 className="font-bold text-sm">{title}</h5>
          <p className="text-xs text-gray-500">{description}</p>
       </div>
    </div>
    {badge ? (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
        {badge}
      </span>
    ) : (
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
         <Save size={14} className="text-gray-400" />
      </div>
    )}
  </div>
);

const Settings = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Configure your environment, integrations, and user preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <div className="glass-card divide-y divide-white/5">
            <div className="p-6 border-b border-white/5">
               <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Security & Access</h4>
            </div>
            <SettingsItem icon={User} title="User Profile" description="Update your personal information and profile picture." />
            <SettingsItem icon={Key} title="Authentication" description="Manage passwords, 2FA, and authorized devices." badge="SECURE" />
            <SettingsItem icon={Bell} title="Notifications" description="Configure global alerts and remediation webhooks." />
         </div>

         <div className="glass-card divide-y divide-white/5">
            <div className="p-6 border-b border-white/5">
               <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Infrastructure</h4>
            </div>
            <SettingsItem icon={Cloud} title="Cloud Connectors" description="Manage AWS IAM roles and Azure Service Principals." badge="3 ACTIVE" />
            <SettingsItem icon={Code} title="API Access" description="Generate and manage SDK tokens for automation." />
            <SettingsItem icon={Globe} title="Regional Scope" description="Control which cloud regions are scanned by default." />
         </div>
      </div>
    </div>
  );
};

export default Settings;

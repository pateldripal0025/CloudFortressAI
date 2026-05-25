import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Lock, Eye, FileText, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen w-full bg-[#030711] flex items-center justify-center p-4 md:p-8 relative overflow-hidden text-slate-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00E5FF]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00E5FF] uppercase tracking-widest hover:text-[#00E5FF]/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00E5FF]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">CloudFortress AI</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Glowing Header Blob */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[50px] bg-gradient-to-r from-[#00E5FF]/20 to-blue-600/20 blur-[30px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight bg-gradient-to-r from-white via-slate-200 to-[#00E5FF] bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-slate-400 text-sm">Last updated: May 24, 2026</p>
            </div>

            <div className="space-y-8 text-sm leading-relaxed">
              {/* Introduction Card */}
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex gap-4 items-start">
                <Lock className="w-6 h-6 text-[#00E5FF] shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-bold text-base mb-1">Our Privacy Commitment</h3>
                  <p className="text-slate-400">
                    At CloudFortress AI, privacy is built into our core framework. We engineer our platform with robust data isolation guardrails to guarantee that your infrastructure intelligence, credential layers, and vulnerability reports remain entirely yours.
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">01.</span> Data Collection Channels
                </h2>
                <p>
                  To secure your cloud environments, CloudFortress AI retrieves metrics regarding your system configurations, metadata, resources, and access patterns. Specifically, we collect:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-4 text-slate-400">
                  <li>Account identifiers, organization tags, and security operator names.</li>
                  <li>Cloud environment telemetry (instance IDs, resource configurations, network security group rules).</li>
                  <li>Usage metrics, audit histories, and authentication browser profiles for defense purposes.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">02.</span> Purpose of Processing
                </h2>
                <p>
                  We process telemetry strictly to run AI-powered risk scoring, real-time threat analysis, and automated configuration compliance audits. 
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                    <span className="text-xs font-bold text-[#00E5FF] uppercase block mb-1">AI Classification</span>
                    <p className="text-slate-400 text-xs">Clustering infrastructure vulnerability indices using ML classifiers for custom prioritization guides.</p>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                    <span className="text-xs font-bold text-[#00E5FF] uppercase block mb-1">Real-time Telemetry</span>
                    <p className="text-slate-400 text-xs">Broadcasting urgent threat alerts to security operators via active Socket.IO connections.</p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">03.</span> Multi-Tenant Data Isolation
                </h2>
                <p>
                  Every single database transaction, resource profile, and scan result is strictly query-scoped using dedicated <code className="text-[#00E5FF] bg-white/5 px-1.5 py-0.5 rounded text-xs font-mono">tenantId</code> keys. We strictly enforce multi-tenant logical boundaries to prevent raw cross-tenant leaks.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">04.</span> Retaining Credentials
                </h2>
                <p>
                  Password layers are hashed instantly before database commitment using production-grade bcrypt hashing with a salt factor of 12. Reset tokens and email OTPs are stored securely with 256-bit hash signatures and strictly limited active lifespans.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-slate-500">
              <p className="mb-2">&copy; 2026 CloudFortress AI. All operations protected under military-grade encryption.</p>
              <div className="flex justify-center gap-4">
                <Link to="/terms" className="hover:text-[#00E5FF] transition-colors">Terms of Service</Link>
                <span>&bull;</span>
                <Link to="/login" className="hover:text-[#00E5FF] transition-colors">Auth Control</Link>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;

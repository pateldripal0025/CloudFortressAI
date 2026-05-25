import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Terminal, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen w-full bg-[#030711] flex items-center justify-center p-4 md:p-8 relative overflow-hidden text-slate-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00E5FF]/10 blur-[120px] rounded-full" />
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[50px] bg-gradient-to-r from-blue-600/20 to-[#00E5FF]/20 blur-[30px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-500 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-slate-400 text-sm">Last updated: May 24, 2026</p>
            </div>

            <div className="space-y-8 text-sm leading-relaxed">
              {/* Introduction Card */}
              <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex gap-4 items-start">
                <Terminal className="w-6 h-6 text-[#00E5FF] shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-bold text-base mb-1">Operator Agreement</h3>
                  <p className="text-slate-400">
                    This Agreement governs your provision, calibration, and execution of the CloudFortress AI Security Orchestrator. By accessing or initializing the control center, you agree to comply with these military-grade usage criteria.
                  </p>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">01.</span> Operator Accounts & Security
                </h2>
                <p>
                  Security operators are fully responsible for maintaining active, secure credential configurations (strict 8-character minimum passwords, MFA where available) and monitoring session tokens.
                </p>
                <div className="flex items-center gap-2 text-slate-400 pl-4 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />
                  <span>Session tokens are actively monitored for unauthorized device migrations.</span>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">02.</span> Permitted Scanning Boundaries
                </h2>
                <p>
                  You represent and warrant that you hold express authorization and credentials to execute AI threat scans, network perimeter analysis, and database audit hooks on the targeted cloud resource structures (AWS, Azure, GCP).
                </p>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-300 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>
                    <strong>IMPORTANT NOTICE:</strong> Scanning resources without proper administrative authorization is strictly prohibited and constitutes a material breach of this Agreement.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">03.</span> Telemetry Limits & SLAs
                </h2>
                <p>
                  CloudFortress AI runs background discovery simulations and processes real-time API webhooks from external engines. While we strive to maintain 99.9% uptime, CloudFortress provides all risk score classifications, clustering models, and telemetry findings "AS IS" without warranties.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono">04.</span> Termination of Operator Licensure
                </h2>
                <p>
                  We reserve the right to suspend operator keys immediately if we identify suspicious authentication profile profiles (e.g. rapid multi-city login jumps) or unauthorized scanning attempts.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-slate-500">
              <p className="mb-2">&copy; 2026 CloudFortress AI. All operations protected under military-grade encryption.</p>
              <div className="flex justify-center gap-4">
                <Link to="/privacy" className="hover:text-[#00E5FF] transition-colors">Privacy Policy</Link>
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

export default TermsOfService;

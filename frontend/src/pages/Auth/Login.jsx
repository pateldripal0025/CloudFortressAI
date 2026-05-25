import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format. Please provide a standard email.');
      return false;
    }
    if (password.length < 8) {
      toast.error('Security Protocol: Password must be at least 8 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      toast.success('Access Granted. Neural link synchronized.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication override failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030711] flex items-center justify-center p-4 relative overflow-hidden">
      {/* ambient futuristic background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* digital scanner overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_95%,rgba(0,229,255,0.05)_95%)] bg-[size:100%_40px] pointer-events-none opacity-30" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-cyan-500 via-purple-600 to-blue-500 opacity-20 blur-xl group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        
        <div className="bg-slate-950/70 border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl backdrop-blur-2xl relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[1.5px] mb-6 group relative">
              {/* Outer light ring */}
              <div className="absolute inset-0 rounded-3xl bg-cyan-400/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-full bg-[#030711] rounded-[22px] flex items-center justify-center relative z-10">
                <Shield className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tighter uppercase font-mono">
              FORTRESS<span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">AI</span>
            </h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.2em]">Secure Node Gateway</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* email input */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">WORK IDENTITY (EMAIL)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#030711]/60 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all duration-300"
                  placeholder="operator@cloudfortress.ai"
                />
              </div>
            </div>

            {/* password input */}
            <div className="space-y-2 relative">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">DECRYPTION KEY (PASSWORD)</label>
                <Link to="/forgot-password" className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors">OVERRIDE LINK?</Link>
              </div>
              
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#030711]/60 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all duration-300"
                  placeholder="••••••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* remember me checkbox */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only" 
                  />
                  <div className={`w-5 h-5 rounded-md border ${rememberMe ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'border-white/10 bg-[#030711]'} flex items-center justify-center transition-all duration-300`}>
                    {rememberMe && (
                      <svg className="w-3.5 h-3.5 text-[#030711] stroke-[4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-200 transition-colors">MAINTAIN AUTH LINK</span>
              </label>
            </div>

            {/* submit button */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-400/90 hover:to-blue-600/90 text-[#030711] font-black rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(34,211,238,0.25)] uppercase tracking-wider text-xs border border-cyan-400/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Establish Auth Link
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* register page redirection */}
          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              No authorization profiles registered? {' '}
              <Link to="/signup" className="text-cyan-400 font-black hover:underline hover:text-cyan-300 ml-1 transition-colors">PROVISION PROFILE</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-6">
          <Link to="/privacy" className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] hover:text-cyan-400 transition-colors">Privacy protocol</Link>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <Link to="/terms" className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.25em] hover:text-cyan-400 transition-colors">Terms of sector</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

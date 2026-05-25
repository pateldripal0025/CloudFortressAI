import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  const validateForm = () => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format. Please provide a standard email.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Security protocol initialized. Override dispatched.');
    } catch (err) {
      toast.error(err.message || 'Verification override sequence failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030711] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-cyan-500 via-purple-600 to-blue-500 opacity-20 blur-xl pointer-events-none" />

        <div className="bg-slate-950/70 border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl backdrop-blur-2xl relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[1.5px] mb-6">
              <div className="w-full h-full bg-[#030711] rounded-[22px] flex items-center justify-center">
                <KeyRound className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tighter font-mono">Override Link</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest leading-relaxed">Request security override credentials</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">REGISTERED EMAIL</label>
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

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-400/90 hover:to-blue-600/90 text-[#030711] font-black rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(34,211,238,0.25)] uppercase tracking-wider text-xs border border-cyan-400/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Initialize Override
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                A secure password override key has been dispatched to <span className="text-cyan-400 font-bold">{email}</span>. Please verify your communication feeds.
              </p>
              <div className="p-4 bg-cyan-400/10 border border-cyan-400/25 rounded-2xl text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                Override Code: SECURE_BYPASS_INIT
              </div>
            </div>
          )}

          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <Link to="/login" className="text-cyan-400 font-black hover:underline hover:text-cyan-300 text-xs uppercase tracking-wider transition-colors">Return to control center</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

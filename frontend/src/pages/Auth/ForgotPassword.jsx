import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link dispatched! Check your email spooler.');
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030711] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00E5FF]/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10 flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 md:p-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Recover Password</h1>
          <p className="text-slate-400 text-sm text-center mt-1">
            {submitted 
              ? 'Reset authorization dispatched. Check your local email logs.' 
              : 'Enter your account email to dispatch secure recovery links.'}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 text-slate-400 text-sm leading-relaxed">
              If an active operator profile matches <strong className="text-white">{email}</strong>, a secure password modification URL was dispatched to your inbox.
            </div>
            
            <Link 
              to="/login"
              className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#030711] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 group transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Operator Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#00E5FF] transition-colors" />
                <input 
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#030711]/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#030711] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 group transition-all mt-6 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Dispatch Recovery Email
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <Link 
              to="/login"
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-400 mt-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

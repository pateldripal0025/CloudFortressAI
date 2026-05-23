import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, KeyRound, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract email and OTP parameters from query params if coming via verification link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const otpParam = params.get('otp');

    if (emailParam) setEmail(emailParam);
    if (otpParam) setOtp(otpParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || otp.length < 6) {
      toast.error('Please enter a valid email and 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(email, otp);
      toast.success('Account Activated! Welcome to the dashboard.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Verification failed');
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
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Verify Identity</h1>
          <p className="text-slate-400 text-sm text-center mt-1">Enter your OTP verification credentials to activate access.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">One-Time Password (OTP)</label>
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#00E5FF] transition-colors" />
              <input 
                name="otp"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full bg-[#030711]/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-sm tracking-[0.2em] font-bold focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                placeholder="123456"
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
                Confirm Activation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-xs font-medium">
          Need to register a different email? {' '}
          <Link to="/signup" className="text-[#00E5FF] font-bold hover:underline underline-offset-4">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

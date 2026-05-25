import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Password strength check
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strengthScore = getPasswordStrength();
  const getStrengthColor = () => {
    if (strengthScore <= 25) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    if (strengthScore <= 50) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]';
    if (strengthScore <= 75) return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
    return 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]';
  };

  const validateForm = () => {
    if (password.length < 8) {
      toast.error('Security Gate: Password must be at least 8 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passkey Mismatch: The entered credentials do not match.');
      return false;
    }
    if (!token) {
      toast.error('Security Breach: Missing decryption token.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      toast.success('Overload Override Success. Credentials recalibrated.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to update credentials.');
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
            <h1 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tighter font-mono">Recalibrate Keys</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest leading-relaxed">Establish fresh credential values</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">NEW CRITICAL PASSKEY</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#030711]/60 border border-white/5 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all duration-300"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* confirm password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">CONFIRM PASSKEY</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#030711]/60 border border-white/5 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all duration-300"
                  placeholder="Repeat passkey"
                />
              </div>
            </div>

            {/* Strength bar */}
            {password && (
              <div className="space-y-1 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className={`h-full ${getStrengthColor()} transition-all duration-500`}
                    style={{ width: `${strengthScore}%` }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-400/90 hover:to-blue-600/90 text-[#030711] font-black rounded-2xl flex items-center justify-center gap-2 group transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(34,211,238,0.25)] mt-6 uppercase tracking-wider text-xs border border-cyan-400/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Override Credentials
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-8">
            <Link to="/login" className="text-cyan-400 font-black hover:underline hover:text-cyan-300 text-xs uppercase tracking-wider transition-colors">Return to control center</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

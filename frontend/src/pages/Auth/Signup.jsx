import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
  const getStrengthLabel = () => {
    if (strengthScore === 0) return 'NO PASSWORD';
    if (strengthScore <= 25) return 'WEAK PROTOCOL';
    if (strengthScore <= 50) return 'MEDIUM SECURE';
    if (strengthScore <= 75) return 'STRONG GUARD';
    return 'MILITARY CRITICAL';
  };

  const getStrengthColor = () => {
    if (strengthScore <= 25) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    if (strengthScore <= 50) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]';
    if (strengthScore <= 75) return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
    return 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]';
  };

  const validateForm = () => {
    if (!fullname.trim()) {
      toast.error('Please enter your full name.');
      return false;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format. Please provide a standard email.');
      return false;
    }
    if (password.length < 8) {
      toast.error('Security Gate: Password must be at least 8 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await register(fullname, email, password);
      toast.success('Account created! Session initialized successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030711] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glowing nodes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* Grid scanning effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_95%,rgba(0,229,255,0.03)_95%)] bg-[size:100%_40px] pointer-events-none opacity-30" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-4xl relative z-10 flex flex-col md:flex-row bg-slate-950/70 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-2xl"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 opacity-10 blur-2xl pointer-events-none" />

        {/* Left panel - Information Vector */}
        <div className="hidden md:flex flex-col justify-between w-[42%] bg-gradient-to-br from-blue-900/20 via-cyan-500/10 to-purple-950/20 p-12 border-r border-white/5 relative">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(0,229,255,0.05),transparent_50%)]" />
          
          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/10 blur-sm animate-pulse" />
              <Shield className="w-7 h-7 text-cyan-400 relative z-10" />
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-6 leading-tight uppercase font-mono">
              Protect Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">Cloud fleet</span>
            </h2>

            <ul className="space-y-5">
              {[
                'Genetic Attack Vector Identification',
                'Multi-Tenant Cryptographic Isolation',
                'AI Posture & Exposure scoring',
                'Enterprise Compliance Guardrails'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <div className="p-1 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] z-10">
            Node Registry Version 2.0 // Secured
          </div>
        </div>

        {/* Right panel - Form Fields */}
        <div className="flex-1 p-10 md:p-12 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2 uppercase tracking-tighter font-mono">Provision Access</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Register a new security operator profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* full name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">OPERATOR FULL NAME</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input 
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full bg-[#030711]/60 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* email */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">WORK IDENTITY (EMAIL)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#030711]/60 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5 transition-all duration-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">DECRYPTION PASSKEY</label>
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

            {/* Password strength panel */}
            {password && (
              <div className="space-y-1.5 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center text-[8px] font-black tracking-widest text-slate-500">
                  <span>SECURITY METRIC</span>
                  <span className="font-mono text-cyan-400">{getStrengthLabel()}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
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
                  Initialize Profile
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-xs font-semibold uppercase tracking-wider border-t border-white/5 pt-8">
            Already authenticated? {' '}
            <Link to="/login" className="text-cyan-400 font-black hover:underline hover:text-cyan-300 ml-1 transition-colors">ACCESS HUB</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

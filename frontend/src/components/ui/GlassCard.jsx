import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "", onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`glass-card p-6 overflow-hidden relative cursor-pointer group ${className}`}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00E5FF]/5 blur-[60px] rounded-full group-hover:bg-[#00E5FF]/10 transition-colors duration-500" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;

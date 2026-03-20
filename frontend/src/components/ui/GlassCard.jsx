import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "", onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      onClick={onClick}
      className={`glass-card-premium p-8 overflow-hidden relative cursor-pointer group glow-border-cyan ${className}`}
    >
      {/* Background radial glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full group-hover:bg-cyan-500/10 transition-colors duration-700" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-colors duration-700" />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;


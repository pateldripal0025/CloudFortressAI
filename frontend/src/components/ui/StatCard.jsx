import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => {
  return (
    <GlassCard className={`neon-border`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${colorClass}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <p className="text-[#94a3b8] text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-extrabold mt-1 tracking-tight">
          <AnimatedCounter value={value} />
        </h3>
      </div>
      
      {/* Subtle Progress Bar Decoration */}
      <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-[#00E5FF] to-transparent opacity-50`} 
          style={{ width: '60%' }} 
        />
      </div>
    </GlassCard>
  );
};

export default StatCard;

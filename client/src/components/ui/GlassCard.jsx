import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = false, onClick, ...props }) => {
  const base = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl';
  const hoverClass = hover ? 'transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer' : '';

  return (
    <motion.div
      className={`${base} ${hoverClass} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

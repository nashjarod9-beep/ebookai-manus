import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = "px-6 py-2.5 rounded-xl font-medium transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 select-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-accent/35 border border-transparent",
    secondary: "border border-white/10 hover:border-brand-accent/50 text-white bg-white/5 hover:bg-white/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {/* Halo de survol interne */}
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {children}
    </motion.button>
  );
}

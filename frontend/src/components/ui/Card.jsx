import { motion } from 'framer-motion';
import { scaleOnHover } from '../../design-system/motion';

export default function Card({ children, className = '', hoverEffect = true, onClick, ...props }) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      onClick={onClick}
      whileHover={hoverEffect ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      variants={hoverEffect ? scaleOnHover : undefined}
      className={`
        rounded-2xl shadow-lg backdrop-blur-md bg-white/5 border border-white/10
        transition-all duration-300 relative overflow-hidden
        ${hoverEffect ? 'hover:shadow-brand-primary/20 hover:border-brand-accent/30' : ''}
        ${onClick ? 'cursor-pointer text-left w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Halo lumineux en arrière-plan */}
      {hoverEffect && (
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/10 via-transparent to-brand-accent/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
      )}
      {children}
    </Component>
  );
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3, ease: 'easeIn' } }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleOnHover = {
  hover: { scale: 1.02, transition: { duration: 0.2, ease: 'easeInOut' } },
  tap: { scale: 0.98 }
};

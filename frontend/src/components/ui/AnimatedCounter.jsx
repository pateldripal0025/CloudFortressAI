import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (current) => 
    Math.floor(current).toLocaleString()
  );

  return <motion.span>{display}</motion.span>;
};

export default AnimatedCounter;

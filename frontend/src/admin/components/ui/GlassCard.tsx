import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const pad = { sm: 'p-4', md: 'p-5', lg: 'p-6' };

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`glass-panel rounded-2xl ${pad[padding]} ${hover ? 'glass-panel-hover cursor-default' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

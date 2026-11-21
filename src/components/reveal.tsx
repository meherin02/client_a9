'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduced ? 0 : 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : delay }}>{children}</motion.div>;
}

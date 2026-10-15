"use client";
// Adapted from Amicro fade-in: Next.js client boundary and Reduced Motion support.
// https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/main/registry/ui/fade-in.json
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export function FadeIn({
  children,
  duration = 0.5,
  delay = 0,
  className = "",
}: FadeInProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reducedMotion ? 0 : duration,
        delay: reducedMotion ? 0 : delay,
        ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
      }}
      className={`amicro-fade-in ${className}`}
    >
      {children}
    </motion.div>
  );
}

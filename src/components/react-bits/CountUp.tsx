"use client";

import React, { useEffect, useState } from "react";

export interface CountUpProps {
  value: number;
  durationMs?: number;
  formatter?: (val: number) => string;
  className?: string;
}

/**
 * Adapted from @react-bits/CountUp-TS-TW for Maison AFAF EL ASSLI.
 * Restrained 450ms easeOutCubic numeric transition for primary KPI summaries.
 * Respects prefers-reduced-motion and preserves tabular-nums alignment.
 */
export function CountUp({ value, durationMs = 450, formatter, className = "" }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }
    let start: number | null = null;
    const initial = displayValue;
    const delta = value - initial;
    if (Math.abs(delta) < 1) {
      setDisplayValue(value);
      return;
    }
    let rafId = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(initial + delta * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  return (
    <span className={`tabular-nums ${className}`}>
      {formatter ? formatter(displayValue) : displayValue.toLocaleString()}
    </span>
  );
}

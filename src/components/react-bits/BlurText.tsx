"use client";

import React, { useEffect, useState } from "react";

export interface BlurTextProps {
  text: string;
  className?: string;
  delayMs?: number;
}

/**
 * Adapted from @react-bits/BlurText-TS-TW for Maison AFAF EL ASSLI.
 * Uses GPU-composited transform & opacity + filter blur with automatic
 * prefers-reduced-motion fallback and RTL/LTR word token preservation.
 */
export function BlurText({ text, className = "", delayMs = 35 }: BlurTextProps) {
  const [mounted, setMounted] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [text]);

  return (
    <span className={`inline-flex flex-wrap gap-x-1.5 ${className}`}>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          style={{
            transitionProperty: "transform, opacity, filter",
            transitionDuration: "420ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: `${idx * delayMs}ms`,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(6px)",
            filter: mounted ? "blur(0px)" : "blur(4px)",
          }}
          className="inline-block motion-reduce:!transition-none motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!filter-none"
        >
          {word}
        </span>
      ))}
    </span>
  );
}

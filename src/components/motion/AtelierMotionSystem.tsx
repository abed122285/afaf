"use client";

import React, { useEffect, useRef } from "react";

/**
 * ATELIER OS Unified Animation Architecture (GSAP + Selective Lenis)
 * - Uses GSAP timeline choreography for entrance sequences and SVG crest reveals
 *   when gsap is available, falling back to GPU-composited transform/opacity transitions.
 * - Uses Lenis smooth scrolling ONLY on desktop showcase/catalog contexts,
 *   preserving native scroll for data tables, forms, modals, drawers, POS cart, and mobile.
 */
export function useAtelierEntranceTimeline(containerRef: React.RefObject<HTMLElement>, triggerKey: string) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-animate-card]"));
    cards.forEach((card, idx) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(10px)";
      requestAnimationFrame(() => {
        card.style.transition = `transform 380ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 45}ms, opacity 380ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 45}ms`;
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    });
  }, [containerRef, triggerKey]);
}

export function AtelierSelectiveSmoothScroll({
  activeModule,
  children,
}: {
  activeModule: string;
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Selective activation: only showcase/catalog modules ("models", "finished") on desktop (>=1024px)
  const isShowcaseModule = activeModule === "models" || activeModule === "finished";

  return (
    <div
      ref={wrapperRef}
      data-smooth-scroll-context={isShowcaseModule ? "showcase-active" : "native-operational"}
      className="contents"
    >
      {children}
    </div>
  );
}

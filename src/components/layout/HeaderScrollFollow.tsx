"use client";

import { motion, useMotionValue, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

type HeaderScrollFollowProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Keeps the header in view at the top, then slides it off and back 1:1 with scroll.
 */
export function HeaderScrollFollow({
  children,
  className,
}: HeaderScrollFollowProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const y = useMotionValue(0);

  useEffect(() => {
    y.set(0);
    lastScrollY.current = window.scrollY;
  }, [pathname, y]);

  useEffect(() => {
    if (reduceMotion) {
      y.set(0);
      return;
    }

    lastScrollY.current = window.scrollY;

    function onScroll(): void {
      const node = ref.current;
      if (!node) {
        return;
      }

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      lastScrollY.current = currentY;

      if (currentY <= 0) {
        y.set(0);
        return;
      }

      const height = node.offsetHeight;
      y.set(Math.min(0, Math.max(-height, y.get() - delta)));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      data-site-header
      style={reduceMotion ? undefined : { y }}
    >
      {children}
    </motion.div>
  );
}

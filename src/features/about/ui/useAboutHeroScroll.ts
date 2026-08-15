"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useAboutHeroScroll(
  sectionRef: RefObject<HTMLElement | null>,
): void {
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (reduceMotion || !section) {
        return;
      }

      const media = section.querySelector("[data-about-hero-media]");
      const veil = section.querySelector("[data-about-hero-veil]");
      const copy = section.querySelector("[data-about-hero-copy]");
      const words = section.querySelectorAll("[data-about-hero-word]");

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        })
        .fromTo(media, { scale: 1.08, yPercent: 0 }, { scale: 1.2, yPercent: 14 }, 0)
        .fromTo(veil, { opacity: 0.35 }, { opacity: 0.92 }, 0)
        .to(copy, { y: -72 }, 0)
        .to(
          words,
          { yPercent: -40, opacity: 0.15, stagger: 0.05 },
          0,
        );
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );
}

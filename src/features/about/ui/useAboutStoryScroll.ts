"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useAboutStoryScroll(
  sectionRef: RefObject<HTMLElement | null>,
): void {
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (reduceMotion || !section) {
        return;
      }

      gsap.fromTo(
        "[data-story-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "bottom 35%",
            scrub: 0.8,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-story-chapter]").forEach((chapter) => {
        gsap.fromTo(
          chapter,
          { y: 56, rotate: 2, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: chapter,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-story-index]").forEach((indexEl) => {
        gsap.fromTo(
          indexEl,
          { x: -32, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: indexEl,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );
}

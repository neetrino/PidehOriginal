"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import type { RefObject } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function animateGallerySlides(section: HTMLElement, cards: HTMLElement[]): void {
  cards.forEach((card, index) => {
    gsap.set(card, {
      zIndex: index === cards.length - 1 ? 50 : index + 1,
      yPercent: index === 0 ? 0 : 125,
      autoAlpha: index === 0 ? 1 : 0,
    });
  });

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${cards.length * window.innerHeight}`,
      pin: true,
      scrub: 1.1,
      invalidateOnRefresh: true,
    },
  });

  cards.forEach((card, index) => {
    if (index === 0) {
      return;
    }
    timeline.fromTo(
      card,
      { autoAlpha: 1, yPercent: 125 },
      { yPercent: 0, duration: 1 },
      index - 0.38,
    );
  });
}

export function useAboutTeamScroll(
  sectionRef: RefObject<HTMLElement | null>,
): void {
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (reduceMotion || !section) {
        return;
      }
      const cards = gsap.utils.toArray<HTMLElement>("[data-team-card]");
      if (cards.length === 0) {
        return;
      }
      animateGallerySlides(section, cards);
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );
}

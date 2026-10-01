'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useAboutHeroScroll(sectionRef: RefObject<HTMLElement | null>): void {
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (reduceMotion || !section) {
        return;
      }

      const media = section.querySelector('[data-about-hero-media]');
      const copy = section.querySelector('[data-about-hero-copy]');
      const words = section.querySelectorAll('[data-about-hero-word]');

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
        .fromTo(media, { y: 0 }, { y: -16 }, 0)
        .to(copy, { y: -20 }, 0)
        .to(words, { y: -8, opacity: 0.45, stagger: 0.04 }, 0);
    },
    { scope: sectionRef, dependencies: [reduceMotion] },
  );
}

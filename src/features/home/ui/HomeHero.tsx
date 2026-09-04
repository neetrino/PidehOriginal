"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { springSoft } from "@/components/motion/presets";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { HomeHeroMedia } from "@/features/home/ui/HomeHeroMedia";
import { HomeHeroTitle } from "@/features/home/ui/HomeHeroTitle";
import type { StorefrontHeroSlide } from "@/features/hero/application/queries";

type HomeHeroProps = {
  slides: StorefrontHeroSlide[];
  fallbackTitle: string;
  fallbackTitleAccent: string;
  fallbackCtaLabel: string;
  fallbackCtaHref: string;
};

const HERO_ROTATE_MS = 5000;

/**
 * Figma hero (frame 1:76 top): orange base, Pricehigh title sandwiching the
 * pide media (51:133), CTA Button 7 below.
 */
export function HomeHero({
  slides,
  fallbackTitle,
  fallbackTitleAccent,
  fallbackCtaLabel,
  fallbackCtaHref,
}: HomeHeroProps) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const hasSlides = slides.length > 0;
  const active = hasSlides ? slides[index] : null;

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, HERO_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [slides.length, reduceMotion]);

  const title = active?.copy.title ?? fallbackTitle;
  const ctaLabel = active?.copy.buttonLabel ?? fallbackCtaLabel;
  const ctaHref = active?.copy.buttonUrl ?? fallbackCtaHref;
  const heroImage =
    active?.desktopImageUrl ??
    active?.mobileImageUrl ??
    PIDEH_ASSETS.foodPide;

  const titleParts = title.split(/\n| \| /);
  const line1 = titleParts[0]?.trim() || fallbackTitle;
  const line2 = titleParts[1]?.trim() || fallbackTitleAccent;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[863px] overflow-x-clip overflow-y-visible bg-pideh-orange pt-[100px] pb-28 md:pb-36"
    >
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center px-4 text-center">
        <motion.div
          className="relative w-full max-w-[1100px] overflow-visible pt-6 md:min-h-[520px] md:pt-8"
          style={reduceMotion ? undefined : { y: mediaY }}
        >
          <motion.div
            className="relative overflow-visible"
            initial={reduceMotion ? false : { scale: 0.92, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={springSoft}
          >
            <HomeHeroTitle line1={line1} line2={line2} />
            <HomeHeroMedia imageSrc={heroImage} />
          </motion.div>
        </motion.div>

        <motion.div
          className="pideh-hero-cta relative z-30 mt-44 md:mt-64"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSoft, delay: 0.45 }}
        >
          <PidehPillButton href={ctaHref} label={ctaLabel} tone="dark" />
        </motion.div>

        {slides.length > 1 ? (
          <div className="relative z-30 mt-6 flex gap-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                className={
                  slideIndex === index
                    ? "h-2.5 w-8 rounded-full bg-white"
                    : "h-2.5 w-2.5 rounded-full bg-white/50"
                }
                onClick={() => setIndex(slideIndex)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

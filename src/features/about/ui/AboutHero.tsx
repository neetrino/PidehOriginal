"use client";

import Image from "next/image";
import { useRef } from "react";

import { titleSweep } from "@/components/motion/presets";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { ABOUT_HERO_IMAGE } from "@/features/about/content/team-members";
import { AboutMarquee } from "@/features/about/ui/AboutMarquee";
import { useAboutHeroScroll } from "@/features/about/ui/useAboutHeroScroll";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutHeroProps = {
  copy: Dictionary["about"];
};

export function AboutHero({ copy }: AboutHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useAboutHeroScroll(sectionRef);
  const titleWords = copy.title.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden pt-[100px] md:min-h-[863px]"
    >
      <div
        data-about-hero-media
        className="absolute inset-0 origin-center will-change-transform"
      >
        <Image
          src={ABOUT_HERO_IMAGE}
          alt={copy.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
      </div>
      <div
        data-about-hero-veil
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#fff8e7] via-[#fff8e7]/75 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-16 h-24 bg-gradient-to-t from-pideh-cream/80 to-transparent"
      />
      <div
        data-about-hero-copy
        className="relative z-[1] flex min-h-[calc(100svh-100px)] max-w-[52rem] -translate-y-28 flex-col justify-center py-16 pr-6 pb-24 pl-4 will-change-transform sm:pl-6 md:min-h-[763px] md:-translate-y-40 lg:pl-8"
      >
        <RevealOnView>
          <p className="text-sm font-semibold tracking-[0.22em] text-pideh-orange uppercase">
            {copy.eyebrow}
          </p>
        </RevealOnView>
        <RevealOnView variants={titleSweep} delay={0.06}>
          <h1 className="font-display mt-5 max-w-4xl text-5xl leading-[0.92] font-black tracking-tight text-pideh-ink md:text-7xl lg:text-8xl">
            {titleWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                data-about-hero-word
                className="mr-[0.22em] inline-block will-change-transform"
              >
                {word}
              </span>
            ))}
          </h1>
        </RevealOnView>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-20">
        <AboutMarquee items={copy.marquee} />
      </div>
    </section>
  );
}

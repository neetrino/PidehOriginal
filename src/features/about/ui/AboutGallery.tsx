"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import { ABOUT_GALLERY } from "@/features/about/content/team-members";
import { useAboutTeamScroll } from "@/features/about/ui/useAboutTeamScroll";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutGalleryProps = {
  copy: Dictionary["about"];
};

export function AboutGallery({ copy }: AboutGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  useAboutTeamScroll(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative z-40 h-dvh w-full overflow-hidden bg-pideh-cream p-3 sm:p-5"
    >
      <div
        className={
          reduceMotion
            ? "flex h-full flex-col gap-4 overflow-y-auto"
            : "absolute inset-3 overflow-hidden bg-pideh-cream sm:inset-5"
        }
      >
        {ABOUT_GALLERY.map((slide, index) => {
          const caption = copy.gallery[index];
          const step = String(index + 1).padStart(2, "0");

          return (
            <article
              key={slide.id}
              data-team-card
              className={`overflow-hidden rounded-[28px] bg-pideh-cream sm:rounded-[36px] ${
                reduceMotion
                  ? "relative min-h-[70vh] w-full shrink-0"
                  : "absolute inset-0"
              }`}
            >
              <Image
                src={slide.src}
                alt={caption?.alt ?? copy.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 py-8 sm:px-10 sm:py-10">
                <h2 className="font-display text-3xl text-white uppercase md:text-5xl">
                  {caption?.title ?? ""}
                </h2>
                <p className="font-mono text-sm tracking-[0.2em] text-white/80">
                  {step}/{String(ABOUT_GALLERY.length).padStart(2, "0")}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

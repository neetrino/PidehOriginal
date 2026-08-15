"use client";

import { useRef } from "react";

import { useAboutStoryScroll } from "@/features/about/ui/useAboutStoryScroll";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutStoryProps = {
  copy: Dictionary["about"];
};

export function AboutStory({ copy }: AboutStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useAboutStoryScroll(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-10 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 right-[-6rem] font-display text-[28vw] leading-none text-pideh-orange/8 select-none"
      >
        01
      </div>
      <div className="relative mx-auto max-w-6xl">
        <div
          aria-hidden="true"
          data-story-line
          className="absolute top-6 bottom-6 left-[1.15rem] origin-top w-1 rounded-full bg-gradient-to-b from-pideh-yellow via-pideh-orange to-pideh-orange md:left-[5.5rem]"
        />
        <ol className="space-y-10 md:space-y-14">
          {copy.paragraphs.map((paragraph, index) => {
            const title = copy.storyTitles[index] ?? copy.eyebrow;
            const step = String(index + 1).padStart(2, "0");

            return (
              <li
                key={step}
                className="grid items-start gap-4 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-8"
              >
                <p
                  data-story-index
                  className="font-display pl-10 text-5xl leading-none text-pideh-orange md:pl-0 md:text-7xl"
                >
                  {step}
                </p>
                <article
                  data-story-chapter
                  className="relative ml-10 rounded-[2px] bg-white px-6 py-7 shadow-[12px_16px_0_0_var(--pideh-yellow)] md:ml-0 md:px-10 md:py-9"
                >
                  <span className="absolute top-8 -left-[1.85rem] size-3 rounded-full bg-pideh-orange ring-4 ring-pideh-yellow md:top-10 md:-left-[2.35rem]" />
                  <h2 className="font-display text-2xl text-pideh-ink uppercase md:text-3xl">
                    {title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-pideh-ink/75 md:text-lg">
                    {paragraph}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

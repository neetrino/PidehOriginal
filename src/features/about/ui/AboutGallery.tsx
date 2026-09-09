'use client';

import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { useRef } from 'react';

import { ABOUT_GALLERY } from '@/features/about/content/team-members';
import { useAboutTeamScroll } from '@/features/about/ui/useAboutTeamScroll';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AboutGalleryProps = {
  copy: Dictionary['about'];
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
            ? 'flex h-full flex-col gap-4 overflow-y-auto'
            : 'absolute inset-3 overflow-hidden bg-pideh-cream sm:inset-5'
        }
      >
        {ABOUT_GALLERY.map((slide, index) => {
          const caption = copy.gallery[index];

          return (
            <article
              key={slide.id}
              data-team-card
              className={`overflow-hidden rounded-[28px] bg-pideh-cream sm:rounded-[36px] ${
                reduceMotion ? 'relative min-h-[70vh] w-full shrink-0' : 'absolute inset-0'
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
            </article>
          );
        })}
      </div>
    </section>
  );
}

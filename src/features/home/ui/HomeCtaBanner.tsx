import Image from "next/image";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { HomeOrangeCtaWave } from "@/features/home/ui/HomeOrangeCtaWave";

type HomeCtaBannerProps = {
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Figma CTA (1:186) on Rectangle 6 (1:81) orange drip over the reviews yellow band.
 */
export function HomeCtaBanner({
  titleLine1,
  titleLine2,
  description,
  ctaLabel,
  ctaHref,
}: HomeCtaBannerProps) {
  return (
    <section className="relative -mt-[40px] overflow-x-clip bg-[#ffcf48] md:-mt-[64px]">
      {/* Figma Rectangle 6 (1:81) — orange wave; yellow reviews band shows in drip edge */}
      <div className="absolute inset-x-0 top-0 z-0 w-full">
        <HomeOrangeCtaWave />
      </div>

      <div className="relative z-10 px-4 pt-28 pb-12 md:px-10 md:pt-36 md:pb-16 lg:px-14">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[32px] bg-gradient-to-b from-[#ff6b00] to-[#ffd54a] px-6 py-16 text-center md:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 bottom-[-40%] hidden h-[420px] w-[280px] rotate-[64deg] md:block"
          >
            <Image
              src={PIDEH_ASSETS.foodPide}
              alt=""
              fill
              className="object-contain opacity-90"
              sizes="280px"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-24 hidden h-[480px] w-[260px] -rotate-[18deg] md:block"
          >
            <Image
              src={PIDEH_ASSETS.foodPide}
              alt=""
              fill
              className="object-contain opacity-90"
              sizes="260px"
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <span className="absolute top-10 left-14 size-3 rounded-full bg-[#7cb342]/80" />
            <span className="absolute top-28 left-[18%] size-4 rounded-full bg-[#ff6b00]/70" />
            <span className="absolute top-16 right-[28%] size-4 rounded-full bg-[#7cb342]/70" />
            <span className="absolute right-20 bottom-24 size-3 rounded-full bg-[#ff6b00]/60" />
            <span className="absolute bottom-16 left-[40%] size-3 rounded-full bg-[#7cb342]/70" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-[780px] flex-col items-center gap-5">
            <h2 className="font-display text-[clamp(2.25rem,6vw,5rem)] text-white">
              <span className="block">{titleLine1}</span>
              <span className="block">{titleLine2}</span>
            </h2>
            <p className="max-w-[650px] text-lg leading-[1.25] text-white">
              {description}
            </p>
            <PidehPillButton
              href={ctaHref}
              label={ctaLabel}
              tone="orange"
              className="w-full max-w-[300px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

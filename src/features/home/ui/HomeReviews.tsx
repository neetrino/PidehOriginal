import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { pillPop, titleSweep } from "@/components/motion/presets";
import {
  HomeReviewsCarousel,
  type HomeReviewItem,
} from "@/features/home/ui/HomeReviewsCarousel";
import { HomeYellowWave } from "@/features/home/ui/HomeYellowWave";

type HomeReviewsProps = {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  reviews: readonly HomeReviewItem[];
};

/**
 * Figma Reviews (1:431) on Rectangle 5 yellow drip. Copy stays i18n.
 */
export function HomeReviews({
  title,
  viewAllLabel,
  viewAllHref,
  reviews,
}: HomeReviewsProps) {
  return (
    <section
      className="relative z-[15] overflow-x-clip bg-[#ff6b00] pb-32 md:pb-44"
      style={{ clipPath: "inset(-81px 0 0 0)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-81px] z-0 w-full"
      >
        <HomeYellowWave />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[22%] bottom-0 z-0 bg-[#ffcf48]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pt-12 md:px-10 md:pt-16">
        <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
          <RevealOnView variants={titleSweep}>
            <h2
              className="font-display text-[#ff6b00]"
              style={{
                fontSize: "clamp(2.5rem, 9vw, 140px)",
                lineHeight: 0.78,
              }}
            >
              {title}
            </h2>
          </RevealOnView>
          <RevealOnView variants={pillPop} delay={0.1}>
            <PidehPillButton
              href={viewAllHref}
              label={viewAllLabel}
              tone="orange"
            />
          </RevealOnView>
        </div>
      </div>

      <div className="relative z-10 w-full pb-8">
        <HomeReviewsCarousel reviews={reviews} />
      </div>
    </section>
  );
}

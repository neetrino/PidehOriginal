import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { pillPop, reviewCard, titleSweep } from "@/components/motion/presets";
import { HomeYellowWave } from "@/features/home/ui/HomeYellowWave";

type ReviewItem = {
  name: string;
  text: string;
  badge: string;
};

type HomeReviewsProps = {
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  reviews: readonly ReviewItem[];
};

/** Figma Reviews (1:431) — 1440 × 834. */
const FRAME = { w: 1440, h: 834 } as const;

function figmaBox(x: number, y: number, width: number, height: number) {
  return {
    left: `${(x / FRAME.w) * 100}%`,
    top: `${(y / FRAME.h) * 100}%`,
    width: `${(width / FRAME.w) * 100}%`,
    height: `${(height / FRAME.h) * 100}%`,
  };
}

function ReviewCard({
  review,
  className = "",
}: {
  review: ReviewItem;
  className?: string;
}) {
  return (
    <article
      className={`flex shrink-0 flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-[0px_10px_24px_0px_rgba(31,20,8,0.09)] ${className}`}
    >
      <div className="flex items-center gap-[14px]">
        <div
          className="size-12 shrink-0 rounded-full bg-[#ff6b00]"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-[3px]">
          <p className="text-base leading-[1.25] font-bold text-[#1e1e1e]">
            {review.name}
          </p>
          <p
            className="text-[13px] leading-[1.25] font-bold text-[#ff6b00]"
            aria-label="5 stars"
          >
            ★★★★★
          </p>
        </div>
      </div>
      <p
        className="size-[50px] text-[54px] leading-[1.25] font-extrabold text-[#ff6b00]"
        aria-hidden="true"
      >
        “
      </p>
      <p className="h-[73px] w-[373px] text-[15px] leading-[1.25] text-[#1e1e1e]">
        {review.text}
      </p>
      <p className="mt-auto text-[12px] leading-[1.25] font-medium whitespace-nowrap text-[#ff6b00]">
        {review.badge}
      </p>
    </article>
  );
}

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

      <div className="relative z-10 px-4 py-12 md:hidden">
        <RevealOnView variants={titleSweep}>
          <h2
            className="font-display mb-6 text-[#ff6b00]"
            style={{
              fontSize: "clamp(2.5rem, 12vw, 4.5rem)",
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
            className="mb-8"
          />
        </RevealOnView>
        <StaggerGroup
          className="-mx-4 flex gap-[30px] overflow-x-auto px-4 pb-4"
          stagger={0.1}
        >
          {reviews.map((review, index) => (
            <StaggerItem
              key={`${review.name}-${index}`}
              variants={reviewCard}
            >
              <ReviewCard review={review} className="h-[242px] w-[434px]" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <div
        className="relative z-10 mx-auto hidden w-full max-w-[1440px] md:block"
        style={{ aspectRatio: `${FRAME.w} / ${FRAME.h}` }}
      >
        <RevealOnView
          className="font-display absolute z-20 text-[#ff6b00]"
          style={{
            ...figmaBox(40, 79, 1076, 218),
            fontSize: "clamp(3.5rem, 9.72vw, 140px)",
            lineHeight: 0.78,
          }}
          variants={titleSweep}
        >
          <h2>{title}</h2>
        </RevealOnView>

        <RevealOnView
          className="absolute z-20"
          style={figmaBox(1220, 243, 213, 56)}
          variants={pillPop}
          delay={0.1}
        >
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="orange"
            className="h-full w-full"
          />
        </RevealOnView>

        <StaggerGroup
          className="absolute z-20 flex items-center"
          style={{
            ...figmaBox(-193, 417, 1826, 242),
            gap: `${(30 / 1826) * 100}%`,
          }}
          stagger={0.1}
        >
          {reviews.map((review, index) => (
            <StaggerItem
              key={`${review.name}-${index}`}
              variants={reviewCard}
              className="h-full w-[23.77%]"
            >
              <ReviewCard review={review} className="h-full w-full" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

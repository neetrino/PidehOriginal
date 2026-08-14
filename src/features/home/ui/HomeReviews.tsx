import { PidehPillButton } from "@/components/brand/PidehPillButton";
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

/**
 * Figma Reviews (1:431) on Rectangle 5 (1:80) yellow drip over the orange page base.
 * Title fill in design: #FF6B00.
 */
export function HomeReviews({
  title,
  viewAllLabel,
  viewAllHref,
  reviews,
}: HomeReviewsProps) {
  return (
    <section className="relative -mt-[48px] overflow-x-clip bg-[#ff6b00] md:-mt-[80px]">
      {/* Figma Rectangle 5 (1:80) — yellow wave; orange base shows through drip edge */}
      <div className="absolute inset-x-0 top-0 z-0 w-full">
        <HomeYellowWave />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pt-28 pb-16 md:px-10 md:pt-36 md:pb-20 lg:px-14">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <h2
            className="font-display max-w-[16ch] text-[#ff6b00]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 7rem)" }}
          >
            {title}
          </h2>
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="yellow"
            className="self-start"
          />
        </div>

        <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
          {reviews.map((review, index) => (
            <article
              key={`${review.name}-${index}`}
              className="w-[min(434px,85vw)] shrink-0 rounded-[24px] bg-white p-6 md:w-auto"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="size-12 shrink-0 rounded-full bg-[#d9d9d9]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-base leading-5 font-bold text-[#1e1e1e]">
                    {review.name}
                  </p>
                  <p
                    className="text-sm leading-4 font-bold text-[#ff6b00]"
                    aria-label="5 stars"
                  >
                    ★★★★★
                  </p>
                </div>
              </div>

              <p
                className="mt-3 text-[50px] leading-none font-bold text-[#ff6b00]"
                aria-hidden="true"
              >
                “
              </p>
              <p className="-mt-2 text-base leading-[1.35] text-[#1e1e1e]">
                {review.text}
              </p>
              <p className="mt-4 text-[13px] leading-[15px] font-medium text-[#6b6b6b]">
                {review.badge}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import "@/features/home/ui/home-reviews-marquee.css";

const CARD_GAP_PX = 30;

export type HomeReviewItem = {
  name: string;
  text: string;
  badge: string;
};

type HomeReviewsCarouselProps = {
  reviews: readonly HomeReviewItem[];
};

function ReviewCard({ review }: { review: HomeReviewItem }) {
  return (
    <article className="flex h-[242px] w-[min(434px,85vw)] shrink-0 flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-[0px_10px_24px_0px_rgba(31,20,8,0.09)]">
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
            aria-hidden="true"
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
      <p className="line-clamp-3 text-[15px] leading-[1.25] text-[#1e1e1e]">
        {review.text}
      </p>
      <p className="mt-auto text-[12px] leading-[1.25] font-medium whitespace-nowrap text-[#ff6b00]">
        {review.badge}
      </p>
    </article>
  );
}

export function HomeReviewsCarousel({ reviews }: HomeReviewsCarouselProps) {
  const loop = [...reviews, ...reviews, ...reviews, ...reviews];

  return (
    <div className="w-full overflow-hidden py-2">
      <div
        className="home-reviews-marquee-track flex w-max"
        style={{ gap: CARD_GAP_PX, paddingRight: CARD_GAP_PX }}
      >
        {loop.map((review, index) => (
          <ReviewCard key={`${review.name}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

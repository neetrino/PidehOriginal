import { HomeCtaCard } from "@/features/home/ui/HomeCtaCard";

type HomeCtaBannerProps = {
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type HomeCtaOrangeBandProps = {
  className?: string;
};

/**
 * Full-bleed orange page band. Sibling behind HomeCtaCard — not its parent.
 */
export function HomeCtaOrangeBand({ className = "" }: HomeCtaOrangeBandProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 bg-[#ff6b00] ${className}`}
    />
  );
}

/**
 * CTA card sits on the reviews-yellow / orange seam and is independent of the orange band.
 */
export function HomeCtaBanner({
  titleLine1,
  titleLine2,
  description,
  ctaLabel,
  ctaHref,
}: HomeCtaBannerProps) {
  return (
    <div className="relative z-30 -mt-16 md:-mt-[120px]">
      <HomeCtaOrangeBand className="top-16 md:top-[120px]" />
      <div className="relative z-10 px-4 pb-12 md:px-10 md:pb-16 lg:px-[100px]">
        <HomeCtaCard
          titleLine1={titleLine1}
          titleLine2={titleLine2}
          description={description}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
        />
      </div>
    </div>
  );
}

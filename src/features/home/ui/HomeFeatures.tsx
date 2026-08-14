import Image from "next/image";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type FeatureItem = {
  title: string;
  imageSrc: string;
  imageClassName: string;
  labelClassName: string;
};

type HomeFeaturesProps = {
  titleLine1: string;
  titleLine2: string;
  viewAllLabel: string;
  viewAllHref: string;
  items: readonly FeatureItem[];
};

/**
 * Figma "Why choose us" (1:408) — sits on the page orange base (#FF6B00)
 * between featured (Rect 4) and reviews (Rect 5).
 */
export function HomeFeatures({
  titleLine1,
  titleLine2,
  viewAllLabel,
  viewAllHref,
  items,
}: HomeFeaturesProps) {
  return (
    <section className="relative overflow-hidden bg-[#ff6b00]">
      <div className="relative mx-auto max-w-[1440px] px-4 py-16 md:px-10 md:py-20 lg:px-14">
        <div className="mb-8 flex flex-col gap-6 md:mb-4 md:flex-row md:items-start md:justify-between">
          <h2 className="font-display max-w-[12ch] text-[clamp(2.75rem,7vw,8.75rem)] text-white">
            <span className="block">{titleLine1}</span>
            <span className="block">{titleLine2}</span>
          </h2>
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="yellow"
            className="self-start border border-[#1e1e1e]/20 md:mt-8"
          />
        </div>

        <div className="relative mt-8 min-h-[320px] md:mt-4 md:min-h-[420px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-10%] top-[35%] hidden h-[200px] md:block"
          >
            <Image
              src={PIDEH_ASSETS.featureWave}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <div className="relative grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <p
                  className={`font-display mb-2 text-[clamp(1.25rem,2.5vw,2.125rem)] text-[#1e1e1e] ${item.labelClassName}`}
                >
                  {item.title}
                </p>
                <div className={`relative ${item.imageClassName}`}>
                  <Image
                    src={item.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 40vw, 280px"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const HOME_FEATURE_VISUALS = [
  {
    key: "delivery" as const,
    imageSrc: PIDEH_ASSETS.featureDelivery,
    imageClassName: "h-[180px] w-[220px] md:h-[220px] md:w-[280px]",
    labelClassName: "order-1",
  },
  {
    key: "prep" as const,
    imageSrc: PIDEH_ASSETS.featurePrep,
    imageClassName: "h-[200px] w-[180px] md:h-[260px] md:w-[220px]",
    labelClassName: "order-2 md:order-none",
  },
  {
    key: "quality" as const,
    imageSrc: PIDEH_ASSETS.featureQuality,
    imageClassName: "h-[180px] w-[180px] md:h-[220px] md:w-[220px]",
    labelClassName: "",
  },
  {
    key: "support" as const,
    imageSrc: PIDEH_ASSETS.featureSupport,
    imageClassName: "h-[200px] w-[200px] md:h-[250px] md:w-[250px]",
    labelClassName: "",
  },
] as const;

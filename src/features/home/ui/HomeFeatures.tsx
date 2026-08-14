import Image from "next/image";

import { PidehPillButton } from "@/components/brand/PidehPillButton";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { FEATURE_ENTRANCES, fadeUp, pillPop, titleSweep } from "@/components/motion/presets";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type FeatureImageBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type FeatureImageCrop = {
  width: string;
  height: string;
  left: string;
  top: string;
};

type FeatureItem = {
  title: string;
  imageSrc: string;
  imageBox: FeatureImageBox;
  imageCrop: FeatureImageCrop;
  labelBox: FeatureImageBox;
};

type HomeFeaturesProps = {
  titleLine1: string;
  titleLine2: string;
  viewAllLabel: string;
  viewAllHref: string;
  items: readonly FeatureItem[];
};

/** Figma “Why choose us” (1:408) — 1440 × 996. */
const FRAME = { w: 1440, h: 996 } as const;

function figmaBox(x: number, y: number, width: number, height: number) {
  return {
    left: `${(x / FRAME.w) * 100}%`,
    top: `${(y / FRAME.h) * 100}%`,
    width: `${(width / FRAME.w) * 100}%`,
    height: `${(height / FRAME.h) * 100}%`,
  };
}

export function HomeFeatures({
  titleLine1,
  titleLine2,
  viewAllLabel,
  viewAllHref,
  items,
}: HomeFeaturesProps) {
  return (
    <section className="relative z-10 overflow-x-clip overflow-y-hidden bg-[#ff6b00]">
      <div className="md:hidden px-4 py-12">
        <RevealOnView variants={titleSweep}>
          <h2 className="font-display mb-6 text-[clamp(2.5rem,12vw,4.5rem)] leading-[0.78] text-white">
            <span className="block">{titleLine1}</span>
            <span className="block">{titleLine2}</span>
          </h2>
        </RevealOnView>
        <RevealOnView variants={pillPop} delay={0.1}>
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="yellow"
            className="mb-8"
          />
        </RevealOnView>
        <StaggerGroup className="grid grid-cols-2 gap-6" stagger={0.1}>
          {items.map((item, index) => (
            <StaggerItem
              key={item.title}
              variants={FEATURE_ENTRANCES[index] ?? fadeUp}
              className="flex flex-col items-center text-center"
            >
              <p className="mb-2 text-[22px] leading-[0.85] font-black text-white">
                {item.title}
              </p>
              <div className="relative h-36 w-full">
                <Image
                  src={item.imageSrc}
                  alt=""
                  fill
                  sizes="45vw"
                  className="object-contain"
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <div
        className="relative mx-auto hidden w-full max-w-[1440px] md:block"
        style={{ aspectRatio: `${FRAME.w} / ${FRAME.h}` }}
      >
        <RevealOnView
          className="font-display absolute z-30 text-white"
          style={{
            ...figmaBox(42, 42, 812, 218),
            fontSize: "clamp(3.5rem, 9.72vw, 140px)",
            lineHeight: 0.78,
          }}
          variants={titleSweep}
        >
          <h2>
            <span className="block">{titleLine1}</span>
            <span className="block">{titleLine2}</span>
          </h2>
        </RevealOnView>

        <RevealOnView
          className="absolute z-30"
          style={figmaBox(1152, 211, 213, 56)}
          variants={pillPop}
          delay={0.12}
        >
          <PidehPillButton
            href={viewAllHref}
            label={viewAllLabel}
            tone="yellow"
            className="h-full w-full px-6 py-4"
          />
        </RevealOnView>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-0 flex items-center justify-center overflow-visible"
          style={figmaBox(-223, 301, 1885.222, 653.204)}
        >
          <div
            className="-scale-y-100 relative flex-none rotate-[6.05deg]"
            style={{
              width: "min(1846.904px, 128.26vw)",
              height: "min(461.004px, 32.014vw)",
            }}
          >
            <div
              className="absolute"
              style={{
                top: "-8.79%",
                right: "-2.19%",
                bottom: "-8.78%",
                left: "-2.19%",
              }}
            >
              {/* Decorative SVG stroke — next/image not used for this asset */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PIDEH_ASSETS.featureWave}
                alt=""
                width={1928}
                height={542}
                className="block size-full max-w-none"
              />
            </div>
          </div>
        </div>

        <StaggerGroup className="absolute inset-0 z-20" stagger={0.12}>
          {items.map((item, index) => (
            <StaggerItem
              key={item.title}
              className="absolute inset-0"
              variants={FEATURE_ENTRANCES[index] ?? fadeUp}
            >
              <p
                className="absolute z-20 text-[32px] leading-[0.85] font-black text-white"
                style={figmaBox(
                  item.labelBox.left,
                  item.labelBox.top,
                  item.labelBox.width,
                  item.labelBox.height,
                )}
              >
                {item.title}
              </p>
              <div
                className="absolute z-20 overflow-hidden"
                style={figmaBox(
                  item.imageBox.left,
                  item.imageBox.top,
                  item.imageBox.width,
                  item.imageBox.height,
                )}
              >
                <Image
                  src={item.imageSrc}
                  alt=""
                  width={640}
                  height={640}
                  sizes="320px"
                  className="absolute max-w-none"
                  style={item.imageCrop}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

export const HOME_FEATURE_VISUALS = [
  {
    key: "delivery" as const,
    imageSrc: PIDEH_ASSETS.featureDelivery,
    imageBox: { left: 39, top: 601, width: 318, height: 274 },
    imageCrop: {
      width: "115.09%",
      height: "133.7%",
      left: "-7.55%",
      top: "-17.73%",
    },
    labelBox: { left: 103, top: 519, width: 190, height: 54 },
  },
  {
    key: "prep" as const,
    imageSrc: PIDEH_ASSETS.featurePrep,
    imageBox: { left: 449, top: 359, width: 271, height: 319 },
    imageCrop: {
      width: "184.48%",
      height: "104.39%",
      left: "-42.24%",
      top: "0%",
    },
    labelBox: { left: 470, top: 671, width: 267, height: 54 },
  },
  {
    key: "quality" as const,
    imageSrc: PIDEH_ASSETS.featureQuality,
    imageBox: { left: 783, top: 529, width: 254, height: 265 },
    imageCrop: {
      width: "201.57%",
      height: "128.81%",
      left: "-50%",
      top: "-18.18%",
    },
    labelBox: { left: 807, top: 787, width: 213, height: 54 },
  },
  {
    key: "support" as const,
    imageSrc: PIDEH_ASSETS.featureSupport,
    imageBox: { left: 1122, top: 452, width: 302, height: 298 },
    imageCrop: {
      width: "148.1%",
      height: "100%",
      left: "-22.47%",
      top: "0%",
    },
    labelBox: { left: 1103, top: 412, width: 261, height: 54 },
  },
] as const;

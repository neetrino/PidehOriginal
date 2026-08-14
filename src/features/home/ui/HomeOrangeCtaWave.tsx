import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type HomeOrangeCtaWaveProps = {
  className?: string;
};

/**
 * Figma Rectangle 6 (1:81) — orange drip-wave into the CTA / footer transition.
 * Source: 1439.5 × 1157, fill #FF6B00 (same drip geometry as yellow Rect 3/5).
 */
export function HomeOrangeCtaWave({ className = "" }: HomeOrangeCtaWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${className}`}
      style={{ aspectRatio: "1439.5 / 1157" }}
    >
      {/* Decorative SVG fill — next/image not used for this asset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PIDEH_ASSETS.waveOrangeCta}
        alt=""
        className="absolute inset-0 block size-full max-w-none"
        width={1440}
        height={1157}
      />
    </div>
  );
}

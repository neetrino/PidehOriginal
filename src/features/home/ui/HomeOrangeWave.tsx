import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type HomeOrangeWaveProps = {
  className?: string;
};

/**
 * Figma Rectangle 4 (1:82) — orange drip-wave band for the featured products section.
 * Source: 1657.5 × 1406.7, fill #FF6B00.
 */
export function HomeOrangeWave({ className = "" }: HomeOrangeWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${className}`}
      style={{ aspectRatio: "1657.5 / 1406.7" }}
    >
      {/* Decorative SVG fill — next/image not used for this asset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PIDEH_ASSETS.waveOrange}
        alt=""
        className="absolute inset-0 block size-full max-w-none"
        width={1658}
        height={1407}
      />
    </div>
  );
}

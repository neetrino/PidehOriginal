import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

/**
 * Figma Rectangle 4 (1:82) — keep native aspect so the wavy top is not flattened.
 */
export function HomeOrangeWave({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 ${className}`}
      style={{
        top: "-240px",
        left: "-9.17%",
        width: "115.11%",
        aspectRatio: "1657.54 / 1406.69",
      }}
    >
      {/* Decorative SVG — next/image not used for this asset */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={PIDEH_ASSETS.waveOrange}
        alt=""
        width={1658}
        height={1407}
        className="block size-full max-w-none"
      />
    </div>
  );
}

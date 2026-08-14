import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type HomeYellowWaveProps = {
  className?: string;
  /** Defaults to Rectangle 3 asset; Rectangle 5 (1:80) uses the same geometry. */
  src?: string;
};

/**
 * Figma yellow drip-wave band:
 * - Rectangle 3 (1:79) — categories
 * - Rectangle 5 (1:80) — reviews transition
 * Source: 1439.5×1157 with shadow overflow insets.
 */
export function HomeYellowWave({
  className = "",
  src = PIDEH_ASSETS.waveYellow,
}: HomeYellowWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${className}`}
      style={{ aspectRatio: "1439.5 / 1157" }}
    >
      <div
        className="absolute"
        style={{
          top: "-3.28%",
          right: "-2.36%",
          bottom: "-2.59%",
          left: "-2.36%",
        }}
      >
        {/* Decorative SVG fill — next/image not used for this asset */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="block size-full max-w-none"
          width={1508}
          height={1225}
        />
      </div>
    </div>
  );
}

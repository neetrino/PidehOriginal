import { SwimDripWave } from "@/features/home/ui/SwimDripWave";
import { ORANGE_FEATURED_DRIP } from "@/features/home/ui/wave-paths";

type HomeOrangeWaveProps = {
  className?: string;
};

/**
 * Figma Rectangle 4 (1:82) — orange drip over categories yellow.
 * Same ocean-swell as footer — plays when this band scrolls into view.
 */
export function HomeOrangeWave({ className = "" }: HomeOrangeWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-[-200px] z-0 overflow-hidden md:top-[-260px] ${className}`}
      style={{
        left: "calc(-132 / 1440 * 100%)",
        width: "calc(1657.54 / 1440 * 100%)",
        aspectRatio: "1657.54 / 1406.69",
      }}
    >
      <SwimDripWave
        spec={ORANGE_FEATURED_DRIP}
        className="absolute inset-0"
      />
    </div>
  );
}

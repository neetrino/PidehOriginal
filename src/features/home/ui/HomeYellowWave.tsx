import { SwimDripWave } from "@/features/home/ui/SwimDripWave";
import { YELLOW_DRIP } from "@/features/home/ui/wave-paths";

type HomeYellowWaveProps = {
  className?: string;
};

/**
 * Figma yellow drip-wave band:
 * - Rectangle 3 (1:79) — categories
 * - Rectangle 5 (1:80) — reviews transition
 */
export function HomeYellowWave({ className = "" }: HomeYellowWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${className}`}
      style={{ aspectRatio: "1439.5 / 1157" }}
    >
      <div className="absolute inset-0 [filter:drop-shadow(0_-4px_17px_rgba(199,89,15,0.21))]">
        <SwimDripWave spec={YELLOW_DRIP} />
      </div>
    </div>
  );
}

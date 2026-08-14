import { SwimDripWave } from "@/features/home/ui/SwimDripWave";
import { ORANGE_DRIP } from "@/features/home/ui/wave-paths";

/**
 * Figma Rectangle 4 (1:82) — keep native aspect so the wavy top is not flattened.
 */
export function HomeOrangeWave({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-0 ${className}`}
      style={{
        top: "-240px",
        width: "100%",
        aspectRatio: "1657.54 / 1406.69",
      }}
    >
      <SwimDripWave spec={ORANGE_DRIP} />
    </div>
  );
}

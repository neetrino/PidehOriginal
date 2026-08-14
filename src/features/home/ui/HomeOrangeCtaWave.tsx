import { SwimDripWave } from "@/features/home/ui/SwimDripWave";
import { ORANGE_CTA_DRIP } from "@/features/home/ui/wave-paths";

type HomeOrangeCtaWaveProps = {
  className?: string;
};

/**
 * Figma Rectangle 6 (1:81) — orange drip-wave into the CTA / footer transition.
 */
export function HomeOrangeCtaWave({ className = "" }: HomeOrangeCtaWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${className}`}
      style={{ aspectRatio: "1439.5 / 1157" }}
    >
      <SwimDripWave spec={ORANGE_CTA_DRIP} className="absolute inset-0" />
    </div>
  );
}

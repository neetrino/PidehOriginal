import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";

type MobileEllipse3469Props = {
  className?: string;
};

/**
 * Figma Group 70674 — white drip.
 * Uses the flattened Figma export of the visible band (440×361): the group
 * sits at `top: -280` / 641×641 in Dev Mode; only y=0…361 is on-screen.
 */
export function MobileEllipse3469({ className = "" }: MobileEllipse3469Props) {
  return (
    <div
      aria-hidden="true"
      data-node-id="260:372"
      className={`pointer-events-none absolute top-0 left-1/2 z-[1] w-[440px] max-w-full -translate-x-1/2 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MOBILE_HOME_ASSETS.headerDripPng}
        alt=""
        width={440}
        height={361}
        className="block h-auto w-full max-w-none"
        draggable={false}
      />
    </div>
  );
}

import { MOBILE_HOME_ASSETS } from '@/features/home/ui/mobile/mobile-assets';

type NavEllipse3469Props = {
  className?: string;
};

/** Figma crescent SVG (vertical). −90° only lays it horizontal — not a flip. */
const CRESCENT_W = 268;
const CRESCENT_H = 739;
const DOCK_WIDTH = 440;
/** Horizontal span of the rotated crescent. */
const DOCK_LENGTH_SCALE = (DOCK_WIDTH / CRESCENT_H) * 1.5;
/** Band thickness vs length — a bit slimmer than a uniform scale. */
const DOCK_THICKNESS_SCALE = DOCK_LENGTH_SCALE * 0.84;
/** Scaled band height after rotation — shared with icon layout. */
export const NAV_DOCK_HEIGHT_PX = Math.round(CRESCENT_W * DOCK_THICKNESS_SCALE);
/** Nudge the band slightly toward the bottom of the screen. */
const DOCK_OFFSET_Y_PX = 6;

/**
 * Figma Ellipse 3469 (268:526) — curved crescent dock, slightly thinned.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=268-526
 */
export function NavEllipse3469({ className = '' }: NavEllipse3469Props) {
  return (
    <div
      aria-hidden="true"
      data-node-id="268:526"
      data-name="Ellipse 3469"
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-visible ${className}`}
      style={{ height: NAV_DOCK_HEIGHT_PX }}
    >
      <div
        className="relative w-full max-w-[440px] overflow-visible"
        style={{ height: NAV_DOCK_HEIGHT_PX }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MOBILE_HOME_ASSETS.navEllipse}
          alt=""
          width={CRESCENT_W}
          height={CRESCENT_H}
          className="absolute top-1/2 left-1/2 max-w-none origin-center"
          style={{
            width: CRESCENT_W,
            height: CRESCENT_H,
            transform: `translate(-50%, calc(-50% + ${DOCK_OFFSET_Y_PX}px)) rotate(-90deg) scale(${DOCK_THICKNESS_SCALE}, ${DOCK_LENGTH_SCALE})`,
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

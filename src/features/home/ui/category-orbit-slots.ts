/** Figma Categories frame (1:373) — 1448 × 850. */
export const CATEGORY_FRAME = { w: 1448, h: 850 } as const;

export function categoryFigmaBox(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return {
    left: `${(x / CATEGORY_FRAME.w) * 100}%`,
    top: `${(y / CATEGORY_FRAME.h) * 100}%`,
    width: `${(width / CATEGORY_FRAME.w) * 100}%`,
    height: `${(height / CATEGORY_FRAME.h) * 100}%`,
  };
}

export type OrbitSlotPose = {
  box: ReturnType<typeof categoryFigmaBox>;
  innerClassName: string;
  innerWidth: string;
  innerHeight: string;
  zIndex: number;
};

/**
 * Orbit AABBs from Figma Group 70675 (1:374). Slot 0 is the featured (largest).
 * Inner transforms stay the original Figma leaf classes — do not re-express as Motion rotate.
 */
export const ORBIT_SLOT_POSES: readonly OrbitSlotPose[] = [
  {
    box: categoryFigmaBox(780, 334.45, 516.702, 243.154),
    innerClassName: "-scale-y-100 rotate-90",
    innerWidth: "47.06%",
    innerHeight: "212.5%",
    zIndex: 8,
  },
  {
    box: categoryFigmaBox(1096.52, 91.58, 272.565, 242.72),
    innerClassName: "-scale-y-100 rotate-[125.86deg]",
    innerWidth: "43.33%",
    innerHeight: "103.39%",
    zIndex: 5,
  },
  {
    box: categoryFigmaBox(1414.79, 53, 118.186, 251.145),
    innerClassName: "-scale-y-100",
    innerWidth: "100%",
    innerHeight: "100%",
    zIndex: 3,
  },
  {
    box: categoryFigmaBox(1414.79, 598.42, 118.392, 251.583),
    innerClassName: "",
    innerWidth: "100%",
    innerHeight: "100%",
    zIndex: 3,
  },
  {
    box: categoryFigmaBox(1097.4, 586.96, 263.173, 258.582),
    innerClassName: "rotate-[-133.6deg]",
    innerWidth: "44.87%",
    innerHeight: "97.05%",
    zIndex: 5,
  },
];

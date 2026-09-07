type MobileCategoryLayerProps = {
  src: string;
  alt: string;
  /** Figma frame width (outer rotated box). */
  width: number;
  /** Figma frame height (outer rotated box). */
  height: number;
  /** Intrinsic SVG width. */
  iconWidth: number;
  /** Intrinsic SVG height. */
  iconHeight: number;
  rotateDeg: number;
  className?: string;
};

/**
 * Figma mobile category Layer_1 icon (260:441, 260:996, …).
 * Uses <img> for SVG so orange line-art always paints.
 */
export function MobileCategoryLayer({
  src,
  alt,
  width,
  height,
  iconWidth,
  iconHeight,
  rotateDeg,
  className = "",
}: MobileCategoryLayerProps) {
  return (
    <span
      className={`relative flex items-center justify-center ${className}`}
      style={{ width, height }}
      data-name="Layer_1"
    >
      <span
        className="relative flex-none"
        style={{
          width: iconWidth,
          height: iconHeight,
          transform: `rotate(${rotateDeg}deg)`,
        }}
      >
        {/* SVG category glyph — object-contain keeps natural aspect (no squash) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={iconWidth}
          height={iconHeight}
          className="block size-full max-w-none object-contain"
          draggable={false}
        />
      </span>
    </span>
  );
}

type HomeHeroTitleProps = {
  line1: string;
  line2: string;
  className?: string;
};

const TITLE_STYLE = {
  fontSize: "clamp(3.5rem, 14.9vw, 215px)",
  lineHeight: 0.73,
  letterSpacing: 0,
} as const;

/**
 * Figma Component 1 (51:179) — Pricehigh Black, 215px / leading 0.73.
 * Uses `display: contents` so line z-indexes interleave with the pide media sibling.
 */
export function HomeHeroTitle({
  line1,
  line2,
  className = "",
}: HomeHeroTitleProps) {
  return (
    <h1 className={`font-display contents text-center whitespace-nowrap ${className}`}>
      <span
        className="pideh-hero-title-line1 relative z-[1] block w-full text-white"
        style={TITLE_STYLE}
      >
        {line1}
      </span>
      <span
        className="pideh-hero-title-line2 relative z-[30] -mt-[0.12em] block w-full text-[#ffd64d]"
        style={TITLE_STYLE}
      >
        {line2}
      </span>
    </h1>
  );
}

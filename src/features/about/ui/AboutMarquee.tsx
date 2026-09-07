import "@/features/about/ui/about-marquee.css";

type AboutMarqueeProps = {
  items: readonly string[];
};

/** Enough copies so one loop half is always wider than the viewport. */
const SEGMENT_COPIES = 8;

function buildLoop(items: readonly string[]): string[] {
  if (items.length === 0) {
    return [];
  }
  const segment = Array.from({ length: SEGMENT_COPIES }, () => items).flat();
  return [...segment, ...segment];
}

export function AboutMarquee({ items }: AboutMarqueeProps) {
  const loop = buildLoop(items);

  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-y border-pideh-ink/10 bg-pideh-orange py-5"
    >
      <div className="about-marquee-track flex w-max gap-10">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-display flex shrink-0 items-center gap-10 text-3xl whitespace-nowrap text-white uppercase md:text-4xl"
          >
            {item}
            <span className="text-pideh-yellow" aria-hidden="true">
              ●
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

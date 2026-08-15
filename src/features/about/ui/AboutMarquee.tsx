import "@/features/about/ui/about-marquee.css";

type AboutMarqueeProps = {
  items: readonly string[];
};

export function AboutMarquee({ items }: AboutMarqueeProps) {
  const loop = [...items, ...items];

  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-y border-pideh-ink/10 bg-pideh-orange py-5"
    >
      <div className="about-marquee-track flex w-max gap-10 pr-10">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-display text-3xl whitespace-nowrap text-white uppercase md:text-4xl"
          >
            {item}
            <span className="ml-10 text-pideh-yellow">●</span>
          </span>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";

type ProductSectionHeadingProps = {
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
  title: string;
  hint?: string | null;
  tone: "onOrange" | "onCream" | "onInk";
  titleSize?: "sm" | "md";
};

const TONE_CLASS = {
  onOrange: "text-white",
  onCream: "text-[#ff6b00]",
  onInk: "text-[#1e1e1e]",
} as const;

const TITLE_SIZE_CLASS = {
  sm: "text-sm leading-5",
  md: "text-base leading-5",
} as const;

export function ProductSectionHeading({
  iconSrc,
  iconWidth,
  iconHeight,
  title,
  hint = null,
  tone,
  titleSize = "md",
}: ProductSectionHeadingProps) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${TONE_CLASS[tone]}`}>
      <Image
        src={iconSrc}
        alt=""
        width={iconWidth}
        height={iconHeight}
        className="shrink-0"
      />
      <h2 className={`${TITLE_SIZE_CLASS[titleSize]} font-bold`}>{title}</h2>
      {hint ? (
        <span className="text-base font-normal opacity-90">{hint}</span>
      ) : null}
    </div>
  );
}

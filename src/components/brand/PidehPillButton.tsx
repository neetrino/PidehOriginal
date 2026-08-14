import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";

type PidehPillTone = "dark" | "orange" | "yellow";

type PidehPillButtonProps = {
  href: string;
  label: string;
  tone?: PidehPillTone;
  className?: string;
  showArrow?: boolean;
};

const TONE_CLASS: Record<PidehPillTone, string> = {
  dark: "bg-[#1e1e1e] text-white shadow-[0px_4px_34px_0px_rgba(0,0,0,0.25)]",
  orange:
    "border border-[rgba(255,107,0,0.43)] bg-[#ff6b00] text-white",
  yellow: "bg-[#ffd54a] text-[#1e1e1e]",
};

/**
 * Figma “Button 7 / Button 8” pill CTA used across the Pideh homepage.
 */
export function PidehPillButton({
  href,
  label,
  tone = "orange",
  className = "",
  showArrow = true,
}: PidehPillButtonProps) {
  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      className={`relative inline-flex items-center justify-center gap-1 overflow-hidden rounded-[42px] px-6 py-4 text-base leading-6 font-bold whitespace-nowrap transition hover:brightness-105 ${TONE_CLASS[tone]} ${className}`}
    >
      <span>{label}</span>
      {showArrow ? (
        <ArrowRight className="size-5 shrink-0" aria-hidden="true" strokeWidth={2.5} />
      ) : null}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-23px] left-[calc(50%-155px)] h-[98px] w-[37px] rotate-[16deg] rounded-[60px] opacity-80 blur-[12px] mix-blend-plus-lighter"
        style={{
          backgroundImage:
            "linear-gradient(86deg, rgb(207, 207, 207) 19%, rgb(255, 255, 255) 42%, rgb(186, 186, 186) 98%)",
        }}
      />
    </AppLink>
  );
}

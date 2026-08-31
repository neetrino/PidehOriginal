import Image from "next/image";
import type { MouseEvent } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type PidehPillTone = "dark" | "orange" | "yellow";

type PidehPillSharedProps = {
  label: string;
  tone?: PidehPillTone;
  className?: string;
  showArrow?: boolean;
};

type PidehPillLinkProps = PidehPillSharedProps & {
  href: string;
  onClick?: undefined;
  disabled?: undefined;
};

type PidehPillActionProps = PidehPillSharedProps & {
  href?: undefined;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export type PidehPillButtonProps = PidehPillLinkProps | PidehPillActionProps;

const TONE_CLASS: Record<PidehPillTone, string> = {
  dark: "bg-[#1e1e1e] text-white shadow-[0px_4px_34px_0px_rgba(0,0,0,0.25)]",
  orange: "border border-[rgba(255,107,0,0.43)] bg-[#ff6b00] text-white",
  yellow: "bg-[#ffd54a] text-[#1e1e1e]",
};

const PILL_CLASS =
  "pideh-pill--gleam-hover relative inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[42px] px-6 py-4 text-base leading-[1.25] font-bold whitespace-nowrap transition hover:brightness-105";

/**
 * Figma Button 7 pill CTA — gleam sweep matches Rectangle 2 on 154:1491.
 */
export function PidehPillButton(props: PidehPillButtonProps) {
  const {
    label,
    tone = "orange",
    className = "",
    showArrow = true,
  } = props;
  const invertArrow = tone === "yellow";
  const classes = `${PILL_CLASS} ${TONE_CLASS[tone]} ${className}`;

  if (typeof props.href === "string") {
    return (
      <AppLink href={props.href} prefetchPolicy="intent" className={classes}>
        <PidehPillContent
          label={label}
          showArrow={showArrow}
          invertArrow={invertArrow}
        />
      </AppLink>
    );
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className={`${classes} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <PidehPillContent
        label={label}
        showArrow={showArrow}
        invertArrow={invertArrow}
      />
    </button>
  );
}

function PidehPillContent({
  label,
  showArrow,
  invertArrow,
}: {
  label: string;
  showArrow: boolean;
  invertArrow: boolean;
}) {
  return (
    <>
      <span>{label}</span>
      {showArrow ? <PidehPillArrow invert={invertArrow} /> : null}
      <PidehPillGleam />
    </>
  );
}

function PidehPillArrow({ invert }: { invert: boolean }) {
  return (
    <span className="relative size-5 shrink-0 overflow-clip" aria-hidden="true">
      <span className="absolute inset-[8.33%]">
        <Image
          src={PIDEH_ASSETS.iconArrow}
          alt=""
          width={17}
          height={17}
          className={`size-full max-w-none ${invert ? "brightness-0" : ""}`}
        />
      </span>
    </span>
  );
}

function PidehPillGleam() {
  return (
    <span
      aria-hidden="true"
      className="pideh-pill-gleam pointer-events-none absolute bottom-[-24px] left-[-53px] flex h-[104px] w-[62px] items-center justify-center mix-blend-plus-lighter"
    >
      <span
        className="h-[97px] w-[37px] rotate-[16deg] rounded-[60px] opacity-80 blur-[12px]"
        style={{
          backgroundImage:
            "linear-gradient(86deg, rgb(207, 207, 207) 19%, rgba(255, 255, 255, 0.71) 42%, rgb(186, 186, 186) 98%)",
        }}
      />
    </span>
  );
}

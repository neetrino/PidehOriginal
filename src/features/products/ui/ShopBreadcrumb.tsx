import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type ShopBreadcrumbProps = {
  backHref: string;
  backLabel: string;
  currentLabel: string;
};

export function ShopBreadcrumb({
  backHref,
  backLabel,
  currentLabel,
}: ShopBreadcrumbProps) {
  return (
    <nav aria-label={currentLabel} className="flex items-center gap-2">
      <AppLink
        href={backHref}
        prefetchPolicy="intent"
        className="inline-flex items-center gap-1.5 text-base font-medium text-[rgba(255,107,0,0.62)] transition hover:text-[#ff6b00]"
      >
        <Image
          src={PIDEH_ASSETS.shopBack}
          alt=""
          width={15}
          height={15}
          className="size-[15px] shrink-0"
        />
        {backLabel}
      </AppLink>
      <Image
        src={PIDEH_ASSETS.shopChevron}
        alt=""
        width={14}
        height={14}
        className="size-[14px] shrink-0"
      />
      <span className="text-base font-semibold text-[#ff6b00]">{currentLabel}</span>
    </nav>
  );
}

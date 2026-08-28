import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type ProductDetailBreadcrumbProps = {
  catalogHref: string;
  backLabel: string;
  catalogLabel: string;
  productTitle: string;
};

export function ProductDetailBreadcrumb({
  catalogHref,
  backLabel,
  catalogLabel,
  productTitle,
}: ProductDetailBreadcrumbProps) {
  return (
    <nav
      aria-label={productTitle}
      className="flex flex-wrap items-center gap-1.5 text-base text-white"
    >
      <AppLink
        href={catalogHref}
        prefetchPolicy="intent"
        className="inline-flex items-center gap-1.5 font-medium text-white/70 transition hover:text-white"
      >
        <Image
          src={PIDEH_ASSETS.shopBack}
          alt=""
          width={15}
          height={15}
          className="size-[15px] shrink-0 brightness-0 invert"
        />
        {backLabel}
      </AppLink>
      <span className="text-white/70" aria-hidden>
        /
      </span>
      <AppLink
        href={catalogHref}
        prefetchPolicy="intent"
        className="font-medium text-white/90 transition hover:text-white"
      >
        {catalogLabel}
      </AppLink>
      <span className="text-white/70" aria-hidden>
        /
      </span>
      <span className="font-bold text-white">{productTitle}</span>
    </nav>
  );
}

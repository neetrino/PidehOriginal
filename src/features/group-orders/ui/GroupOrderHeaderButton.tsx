"use client";

import { Users } from "lucide-react";
import { useState } from "react";

import { CreateGroupOrderModal } from "@/features/group-orders/ui/CreateGroupOrderModal";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type GroupOrderHeaderButtonProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
  defaultName?: string;
};

/** Header control next to cart — opens create-group-order modal. */
export function GroupOrderHeaderButton({
  locale,
  labels,
  defaultName,
}: GroupOrderHeaderButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1 rounded-[32px] bg-[#ff6b00] px-2.5 py-2 text-[10px] font-bold tracking-wide text-white uppercase transition hover:brightness-105 sm:gap-1.5 sm:px-3 sm:text-xs md:h-10 md:px-4 md:text-sm"
        aria-label={labels.createButton}
      >
        <Users className="h-4 w-4 shrink-0" aria-hidden />
        <span>{labels.createButton}</span>
      </button>
      <CreateGroupOrderModal
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
        labels={labels}
        defaultName={defaultName}
      />
    </>
  );
}

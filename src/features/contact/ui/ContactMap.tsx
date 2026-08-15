"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { ContactBranchId } from "@/features/contact/ui/contact-locations";

const ContactMapCanvas = dynamic(
  () =>
    import("@/features/contact/ui/ContactMapCanvas").then((mod) => ({
      default: mod.ContactMapCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70vh,540px)] w-full animate-pulse bg-pideh-cream" />
    ),
  },
);

type ContactMapProps = {
  title: string;
  primaryLabel: string;
  secondaryLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
};

export function ContactMap({
  title,
  primaryLabel,
  secondaryLabel,
  zoomInLabel,
  zoomOutLabel,
}: ContactMapProps) {
  const [activeBranchId, setActiveBranchId] = useState<ContactBranchId | null>(
    null,
  );

  return (
    <section className="relative z-0 px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl text-pideh-ink uppercase md:text-4xl">
            {title}
          </h2>
          <div className="flex flex-wrap gap-2">
            <BranchChip
              label={primaryLabel}
              selected={activeBranchId === "andranik"}
              onSelect={() => setActiveBranchId("andranik")}
            />
            <BranchChip
              label={secondaryLabel}
              selected={activeBranchId === "koghbatsi"}
              onSelect={() => setActiveBranchId("koghbatsi")}
            />
          </div>
        </div>
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-3 rotate-1 rounded-[36px] bg-pideh-yellow"
          />
          <div className="contact-map-shell relative overflow-hidden rounded-[32px] ring-4 ring-pideh-orange">
            <ContactMapCanvas
              primaryLabel={primaryLabel}
              secondaryLabel={secondaryLabel}
              zoomInLabel={zoomInLabel}
              zoomOutLabel={zoomOutLabel}
              activeBranchId={activeBranchId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BranchChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        selected
          ? "bg-pideh-orange text-white"
          : "bg-white text-pideh-ink hover:bg-pideh-yellow"
      }`}
    >
      {label}
    </button>
  );
}

"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import type { ContactBranchId } from "@/features/contact/ui/contact-locations";
import { CONTACT_BRANCHES } from "@/features/contact/ui/contact-locations";

type ContactMapControlsProps = {
  zoomInLabel: string;
  zoomOutLabel: string;
};

type FlyToActiveBranchProps = {
  branchId: ContactBranchId | null;
};

export function ContactMapControls({
  zoomInLabel,
  zoomOutLabel,
}: ContactMapControlsProps) {
  const map = useMap();
  const buttonClass =
    "flex size-10 items-center justify-center rounded-full bg-pideh-orange text-lg font-bold text-white shadow-[0_8px_20px_rgba(30,30,30,0.25)]";

  return (
    <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2">
      <button
        type="button"
        className={buttonClass}
        aria-label={zoomInLabel}
        onClick={() => map.zoomIn()}
      >
        +
      </button>
      <button
        type="button"
        className={buttonClass}
        aria-label={zoomOutLabel}
        onClick={() => map.zoomOut()}
      >
        −
      </button>
    </div>
  );
}

export function FlyToActiveBranch({ branchId }: FlyToActiveBranchProps) {
  const map = useMap();

  useEffect(() => {
    if (!branchId) {
      return;
    }
    const branch = CONTACT_BRANCHES.find((item) => item.id === branchId);
    if (!branch) {
      return;
    }
    map.flyTo([branch.lat, branch.lng], 16, { duration: 0.8 });
  }, [branchId, map]);

  return null;
}

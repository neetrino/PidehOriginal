"use client";

import { useCallback, useEffect, useState } from "react";

import type { StorefrontPopup } from "@/features/popups/application/queries";
import { PromoPopupModal } from "@/features/popups/ui/PromoPopupModal";

const DISMISS_STORAGE_PREFIX = "ws_popup_dismissed:";

type PromoPopupClientProps = {
  popup: StorefrontPopup;
  closeLabel: string;
};

function isDismissed(popupId: string): boolean {
  try {
    return sessionStorage.getItem(`${DISMISS_STORAGE_PREFIX}${popupId}`) === "1";
  } catch {
    return false;
  }
}

function markDismissed(popupId: string): void {
  try {
    sessionStorage.setItem(`${DISMISS_STORAGE_PREFIX}${popupId}`, "1");
  } catch {
    // Ignore quota / private-mode failures; popup may reappear this session.
  }
}

/** Opens the active promo popup once per browser session. */
export function PromoPopupClient({
  popup,
  closeLabel,
}: PromoPopupClientProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isDismissed(popup.id)) {
      setOpen(true);
    }
  }, [popup.id]);

  const handleClose = useCallback(() => {
    markDismissed(popup.id);
    setOpen(false);
  }, [popup.id]);

  return (
    <PromoPopupModal
      open={open}
      title={popup.title}
      imageUrl={popup.imageUrl}
      linkUrl={popup.linkUrl}
      closeLabel={closeLabel}
      onClose={handleClose}
    />
  );
}

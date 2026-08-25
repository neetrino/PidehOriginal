import { Suspense } from "react";

import { getActiveStorefrontPopup } from "@/features/popups/application/queries";
import { PromoPopupClient } from "@/features/popups/ui/PromoPopupClient";

type PromoPopupIslandProps = {
  closeLabel: string;
};

async function PromoPopupAsync({ closeLabel }: PromoPopupIslandProps) {
  const popup = await getActiveStorefrontPopup();
  if (!popup) {
    return null;
  }

  return <PromoPopupClient popup={popup} closeLabel={closeLabel} />;
}

/**
 * Streams the active storefront promo popup without blocking layout chrome.
 */
export function PromoPopupIsland({ closeLabel }: PromoPopupIslandProps) {
  return (
    <Suspense fallback={null}>
      <PromoPopupAsync closeLabel={closeLabel} />
    </Suspense>
  );
}

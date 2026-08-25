import { notFound } from "next/navigation";

import { listAdminGiftCards } from "@/features/gift-cards/application/queries";
import { AdminGiftCardsView } from "@/features/gift-cards/ui/AdminGiftCardsView";
import { getStoreGiftCardSettings } from "@/features/settings/application/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminGiftCardsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function AdminGiftCardsPage({
  params,
  searchParams,
}: AdminGiftCardsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const raw = await searchParams;
  const q = firstParam(raw.q) || undefined;
  const [{ items }, settings, dict] = await Promise.all([
    listAdminGiftCards({ q, limit: 100 }),
    getStoreGiftCardSettings(),
    getDictionary(locale),
  ]);

  return (
    <AdminGiftCardsView
      locale={locale}
      cards={items}
      presets={settings.presets}
      copy={{
        giftCards: dict.admin.giftCards,
        common: dict.admin.common,
      }}
    />
  );
}

import { notFound } from "next/navigation";

import { getDeliverySettings } from "@/features/delivery/application/get-delivery-settings";
import { AdminDeliveryView } from "@/features/delivery/ui/AdminDeliveryView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { mediaPublicUrl } from "@/lib/media/public-url";

type AdminDeliveryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDeliveryPage({
  params,
}: AdminDeliveryPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const [settings, dict] = await Promise.all([
    getDeliverySettings(),
    getDictionary(locale),
  ]);

  const initialImageUrls: Record<string, string> = {};
  for (const item of settings.cashChangeDenominations) {
    if (item.imageObjectKey) {
      initialImageUrls[item.id] = mediaPublicUrl(item.imageObjectKey);
    }
  }

  return (
    <AdminDeliveryView
      locale={locale}
      settings={settings}
      initialImageUrls={initialImageUrls}
      copy={{ delivery: dict.admin.delivery, common: dict.admin.common }}
    />
  );
}

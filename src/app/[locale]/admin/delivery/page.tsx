import { notFound } from 'next/navigation';

import { getDeliverySettings } from '@/features/delivery/application/get-delivery-settings';
import { cashChangeImageSrc } from '@/features/delivery/domain/cash-change';
import { listAdminDeliveryLocations } from '@/features/delivery/application/queries';
import { AdminDeliveryView } from '@/features/delivery/ui/AdminDeliveryView';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { mediaPublicUrl } from '@/lib/media/public-url';

type AdminDeliveryPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDeliveryPage({ params }: AdminDeliveryPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const [settings, locations, dict] = await Promise.all([
    getDeliverySettings(),
    listAdminDeliveryLocations(locale),
    getDictionary(locale),
  ]);

  const initialImageUrls: Record<string, string> = {};
  for (const item of settings.cashChangeDenominations) {
    const imageUrl = cashChangeImageSrc(item.imageObjectKey, mediaPublicUrl);
    if (imageUrl) {
      initialImageUrls[item.id] = imageUrl;
    }
  }

  return (
    <AdminDeliveryView
      locale={locale}
      settings={settings}
      locations={locations}
      initialImageUrls={initialImageUrls}
      copy={{ delivery: dict.admin.delivery, common: dict.admin.common }}
    />
  );
}

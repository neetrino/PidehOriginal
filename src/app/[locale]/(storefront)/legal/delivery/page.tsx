import { notFound } from 'next/navigation';

import { LegalDocument } from '@/features/legal/ui/LegalDocument';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type DeliveryTermsPageProps = {
  params: Promise<{ locale: string }>;
};

/** Published food delivery terms linked from the footer. */
export default async function DeliveryTermsPage({ params }: DeliveryTermsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LegalDocument copy={getDictionary(locale).legal.delivery} />;
}

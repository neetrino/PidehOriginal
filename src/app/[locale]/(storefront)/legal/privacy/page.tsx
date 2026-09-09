import { notFound } from 'next/navigation';

import { LegalDocument } from '@/features/legal/ui/LegalDocument';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type PrivacyPageProps = {
  params: Promise<{ locale: string }>;
};

/** Published privacy policy linked from the footer. */
export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LegalDocument copy={getDictionary(locale).legal.privacy} />;
}

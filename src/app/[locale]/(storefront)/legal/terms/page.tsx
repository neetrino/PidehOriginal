import { notFound } from "next/navigation";

import { LegalDocument } from "@/features/legal/ui/LegalDocument";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type TermsPageProps = {
  params: Promise<{ locale: string }>;
};

/** Published terms and conditions linked from the footer. */
export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LegalDocument copy={getDictionary(locale).legal.terms} />;
}

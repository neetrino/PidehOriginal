import { notFound } from "next/navigation";

import { listAdminPopups } from "@/features/popups/application/queries";
import { AdminPopupsView } from "@/features/popups/ui/AdminPopupsView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminPopupsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPopupsPage({ params }: AdminPopupsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const popups = await listAdminPopups();

  return (
    <AdminPopupsView
      locale={locale}
      popups={popups}
      copy={dictionary.admin}
    />
  );
}

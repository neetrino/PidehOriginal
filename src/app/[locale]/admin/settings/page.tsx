import { notFound } from "next/navigation";

import { AdminPageHeading } from "@/features/admin/ui/AdminPageHeading";
import {
  getStoreFxRates,
  getStoreIdentity,
} from "@/features/settings/application/queries";
import { StoreSettingsForms } from "@/features/settings/ui/StoreSettingsForms";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({
  params,
}: AdminSettingsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin.settings;

  const [identity, fxRates] = await Promise.all([
    getStoreIdentity(),
    getStoreFxRates(),
  ]);

  return (
    <section>
      <AdminPageHeading
        className="mb-6"
        title={t.title}
        description={t.subtitle}
      />

      <StoreSettingsForms
        locale={locale}
        identity={identity}
        fxRates={fxRates}
        copy={dictionary.admin}
      />
    </section>
  );
}

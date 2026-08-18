import { notFound } from "next/navigation";

import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import { listAdminGroupOrders } from "@/features/group-orders/application/queries";
import { AdminGroupOrdersView } from "@/features/group-orders/ui/AdminGroupOrdersView";
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getSelectedCurrency } from "@/lib/money/display-price";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminGroupOrdersPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  await requireAdmin(locale);
  const dictionary = getDictionary(locale);
  const currency = await getSelectedCurrency();
  const rows = await listAdminGroupOrders({ limit: 100 });

  return (
    <div className="space-y-6">
      <h1 className={ADMIN_PAGE_TITLE}>{dictionary.admin.nav.groupOrders}</h1>
      <AdminGroupOrdersView locale={locale} currency={currency} rows={rows} />
    </div>
  );
}

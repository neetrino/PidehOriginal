import { notFound } from "next/navigation";

import { AdminDashboard } from "@/features/admin/ui/AdminDashboard";
import {
  defaultAnalyticsDateRange,
  formatPeriodDelta,
} from "@/features/analytics/domain/date-range";
import { getAdminDashboardMetrics } from "@/features/orders/application/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const dash = dictionary.admin.dashboard;

  const metrics = await getAdminDashboardMetrics(defaultAnalyticsDateRange());
  const revenueDelta = dash.revenueDeltaVsPrev.replace(
    "{delta}",
    formatPeriodDelta(metrics.revenueAmount, metrics.previousRevenueAmount),
  );

  return (
    <AdminDashboard
      locale={locale}
      dash={dash}
      navTitle={dictionary.admin.nav.dashboard}
      users={metrics.users}
      products={metrics.products}
      orders={metrics.orders}
      revenueAmount={metrics.revenueAmount}
      revenueDelta={revenueDelta}
      recentOrders={metrics.recentOrders}
      topProducts={metrics.topProducts}
    />
  );
}

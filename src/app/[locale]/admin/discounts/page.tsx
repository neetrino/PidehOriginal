import { notFound } from "next/navigation";

import { AdminPageHeading } from "@/features/admin/ui/AdminPageHeading";
import { getAdminDiscountsBoard } from "@/features/promotions/application/discounts-board";
import { AdminDiscountsView } from "@/features/promotions/ui/AdminDiscountsView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminDiscountsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDiscountsPage({
  params,
}: AdminDiscountsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const [board, dict] = await Promise.all([
    getAdminDiscountsBoard(locale),
    getDictionary(locale),
  ]);

  return (
    <section className="w-full">
      <AdminPageHeading className="mb-6" title={dict.admin.discounts.title} />

      <AdminDiscountsView
        locale={locale}
        board={board}
        copy={{ discounts: dict.admin.discounts, common: dict.admin.common }}
      />
    </section>
  );
}

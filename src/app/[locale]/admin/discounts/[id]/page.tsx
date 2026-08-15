import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ADMIN_PAGE_SUBTITLE,
} from "@/features/admin/ui/admin-form-classes";
import { AdminPageHeading } from "@/features/admin/ui/AdminPageHeading";
import {
  getAdminPromotionById,
  listPromotionTargetOptions,
} from "@/features/promotions/application/queries";
import { PromotionForm } from "@/features/promotions/ui/PromotionForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminDiscountDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminDiscountDetailPage({
  params,
}: AdminDiscountDetailPageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const [promo, targets, dict] = await Promise.all([
    getAdminPromotionById(id),
    listPromotionTargetOptions(),
    getDictionary(locale),
  ]);

  if (!promo || promo.kind !== "AUTOMATIC") {
    notFound();
  }

  return (
    <section>
      <div className="mb-6">
        <p className={`mb-1 ${ADMIN_PAGE_SUBTITLE}`}>
          <Link
            href={`/${locale}/admin/discounts`}
            className="font-medium text-gray-700 hover:underline"
          >
            {dict.admin.discounts.title}
          </Link>
        </p>
        <AdminPageHeading
          title="Automatic discount"
          description={`Used ${promo.usedCount} times`}
        />
      </div>

      <PromotionForm
        locale={locale}
        mode="edit"
        promotionId={promo.id}
        initialKind="AUTOMATIC"
        lockKind
        targets={targets}
        redirectTo={`/${locale}/admin/discounts`}
        copy={{ form: dict.admin.discounts.form, common: dict.admin.common }}
        defaults={{
          code: promo.code,
          productId: promo.productId,
          categoryId: promo.categoryId,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          maxDiscountAmount: promo.maxDiscountAmount,
          minimumOrderAmount: promo.minimumOrderAmount,
          totalUsageLimit: promo.totalUsageLimit,
          perUserUsageLimit: promo.perUserUsageLimit,
          priority: promo.priority,
          allowStacking: promo.allowStacking,
          isActive: promo.isActive,
          startsAt: promo.startsAt,
          endsAt: promo.endsAt,
        }}
      />
    </section>
  );
}

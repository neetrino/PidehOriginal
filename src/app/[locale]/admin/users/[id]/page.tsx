import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
  ADMIN_SECTION_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import { getAdminUserById } from "@/features/users/application/queries";
import {
  getEligibleUserStatuses,
  isUserRole,
  isUserStatus,
} from "@/features/users/domain/user-lifecycle";
import { UpdateUserRoleForm } from "@/features/users/ui/UpdateUserRoleForm";
import { UpdateUserStatusForm } from "@/features/users/ui/UpdateUserStatusForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminUserDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

function userStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "ACTIVE") return "bg-green-100 text-green-800";
  if (normalized === "PENDING" || normalized === "INVITED") {
    return "bg-yellow-100 text-yellow-800";
  }
  if (
    normalized === "SUSPENDED" ||
    normalized === "BANNED" ||
    normalized === "ANONYMIZED"
  ) {
    return "bg-red-100 text-red-800";
  }
  return "bg-gray-100 text-gray-800";
}

function userRoleBadgeClass(role: string): string {
  return role.toUpperCase() === "ADMIN"
    ? "bg-blue-100 text-blue-800"
    : "bg-gray-100 text-gray-800";
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { locale, id } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const t = dictionary.admin;

  const detail = await getAdminUserById(id);
  if (!detail) {
    notFound();
  }

  const { user, recentOrders } = detail;
  const role = isUserRole(user.role) ? user.role : null;
  const status = isUserStatus(user.status) ? user.status : null;
  const eligibleStatuses = status ? getEligibleUserStatuses(status) : [];
  const isAnonymized = status === "ANONYMIZED";

  return (
    <section>
      <div className="mb-6">
        <p className={`mb-1 ${ADMIN_PAGE_SUBTITLE}`}>
          <Link
            href={`/${locale}/admin/users`}
            className="font-medium text-gray-700 hover:underline"
          >
            {t.users.breadcrumb}
          </Link>
        </p>
        <h1 className={ADMIN_PAGE_TITLE}>
          {user.firstName} {user.lastName}
        </h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>{user.email}</p>
      </div>

      <Card className="mb-6 p-6">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p className="text-gray-700">
            {t.users.detail.role}{" "}
            <span
              className={`${ADMIN_BADGE} ${userRoleBadgeClass(user.role)}`}
            >
              {user.role}
            </span>
          </p>
          <p className="text-gray-700">
            {t.users.detail.status}{" "}
            <span
              className={`${ADMIN_BADGE} ${userStatusBadgeClass(user.status)}`}
            >
              {user.status}
            </span>
          </p>
          <p className="text-gray-700">
            {t.users.detail.phone.replace("{phone}", user.phone ?? t.common.none)}
          </p>
          <p className="text-gray-700">
            {t.users.detail.emailVerified.replace(
              "{value}",
              user.emailVerifiedAt
                ? user.emailVerifiedAt.toISOString().slice(0, 10)
                : t.users.detail.emailVerifiedNo,
            )}
          </p>
          <p className="text-gray-700">
            {t.users.detail.lastLogin.replace(
              "{value}",
              user.lastLoginAt
                ? user.lastLoginAt.toISOString().slice(0, 16).replace("T", " ")
                : t.users.detail.lastLoginNever,
            )}
          </p>
          <p className="text-gray-700">
            {t.users.detail.created.replace(
              "{date}",
              user.createdAt.toISOString().slice(0, 10),
            )}
          </p>
        </div>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {role ? (
          <UpdateUserRoleForm
            locale={locale}
            userId={user.id}
            currentRole={role}
            disabled={isAnonymized}
            copy={t}
          />
        ) : (
          <p className="text-sm text-red-700">{t.users.detail.unknownRole}</p>
        )}
        {status ? (
          <UpdateUserStatusForm
            locale={locale}
            userId={user.id}
            currentStatus={status}
            eligibleStatuses={eligibleStatuses}
            copy={t}
          />
        ) : (
          <p className="text-sm text-red-700">{t.users.detail.unknownStatus}</p>
        )}
      </div>

      <Card className="p-6">
        <h2 className={`mb-4 ${ADMIN_SECTION_TITLE}`}>{t.users.detail.recentOrders}</h2>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/${locale}/admin/orders/${order.orderNumber}`}
              className="block rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-gray-900">
                  {order.orderNumber}
                </strong>
                <span
                  className={`${ADMIN_BADGE} ${orderStatusBadgeClass(order.status)}`}
                >
                  {order.status}
                </span>
                <span
                  className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(order.paymentStatus)}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {order.totalAmount.toLocaleString("en-US")} {order.baseCurrency}
              </p>
            </Link>
          ))}
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-600">{t.users.detail.noOrders}</p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

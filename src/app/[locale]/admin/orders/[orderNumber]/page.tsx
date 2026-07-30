import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/Card";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
  ADMIN_SECTION_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import { getAdminOrderByNumber } from "@/features/orders/application/queries";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { mediaPublicUrl } from "@/lib/media/public-url";

type AdminOrderDetailPageProps = {
  params: Promise<{ locale: string; orderNumber: string }>;
};

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("en-US")} ${currency}`;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { locale, orderNumber } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy = dictionary.admin;

  const detail = await getAdminOrderByNumber(decodeURIComponent(orderNumber));
  if (!detail) {
    notFound();
  }

  const { order, items, events } = detail;
  const address = order.shippingAddress;

  const d = copy.orders.detail;

  const deliveryLabel = order.deliveryLabelSnapshot
    ? d.deliveryWithLabel
        .replace("{label}", order.deliveryLabelSnapshot)
        .replace("{amount}", formatMoney(order.deliveryAmount, order.baseCurrency))
    : d.delivery.replace("{amount}", formatMoney(order.deliveryAmount, order.baseCurrency));

  const couponLabel = order.promotionCodeSnapshot
    ? d.couponDiscountWithCode
        .replace("{code}", order.promotionCodeSnapshot)
        .replace("{amount}", formatMoney(order.discountAmount, order.baseCurrency))
    : d.couponDiscount.replace(
        "{amount}",
        formatMoney(order.discountAmount, order.baseCurrency),
      );

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={`mb-1 ${ADMIN_PAGE_SUBTITLE}`}>
            <Link
              href={`/${locale}/admin/orders`}
              className="font-medium text-gray-700 hover:underline"
            >
              {copy.orders.breadcrumb}
            </Link>
          </p>
          <h1 className={ADMIN_PAGE_TITLE}>{order.orderNumber}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
            {order.isArchived ? (
              <span className={`${ADMIN_BADGE} bg-gray-100 text-gray-800`}>
                {d.archivedBadge}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className={`mb-3 ${ADMIN_SECTION_TITLE}`}>{d.customer}</h2>
          <p className="text-sm font-medium text-gray-900">{order.contactName}</p>
          <p className="text-sm text-gray-600">{order.contactEmail}</p>
          <p className="text-sm text-gray-600">{order.contactPhone}</p>
          <p className="mt-3 text-sm text-gray-600">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
            <br />
            {address.city}
            {address.region ? `, ${address.region}` : ""}
            <br />
            {address.countryCode}
            {address.postalCode ? ` ${address.postalCode}` : ""}
          </p>
          {address.floor ||
          address.intercomCode ||
          address.scheduledDeliveryDate ||
          address.cashChangeAmount != null ? (
            <dl className="mt-3 space-y-1 text-sm text-gray-600">
              {address.floor ? (
                <div className="flex gap-2">
                  <dt className="text-gray-500">{d.floor}</dt>
                  <dd className="font-medium text-gray-900">{address.floor}</dd>
                </div>
              ) : null}
              {address.intercomCode ? (
                <div className="flex gap-2">
                  <dt className="text-gray-500">{d.intercomCode}</dt>
                  <dd className="font-medium text-gray-900">
                    {address.intercomCode}
                  </dd>
                </div>
              ) : null}
              {address.scheduledDeliveryDate &&
              address.scheduledDeliveryStart &&
              address.scheduledDeliveryEnd ? (
                <div className="flex gap-2">
                  <dt className="text-gray-500">{d.deliverySlot}</dt>
                  <dd className="font-medium text-gray-900">
                    {address.scheduledDeliveryDate}{" "}
                    {address.scheduledDeliveryStart}–
                    {address.scheduledDeliveryEnd}
                  </dd>
                </div>
              ) : null}
              {address.cashChangeAmount != null ? (
                <div className="flex items-center gap-2">
                  <dt className="text-gray-500">{d.cashChange}</dt>
                  <dd className="flex items-center gap-2 font-medium text-gray-900">
                    {address.cashChangeImageKey ? (
                      // eslint-disable-next-line @next/next/no-img-element -- CDN/local media URL
                      <img
                        src={mediaPublicUrl(address.cashChangeImageKey)}
                        alt=""
                        className="h-8 w-12 rounded object-contain"
                      />
                    ) : null}
                    {formatMoney(address.cashChangeAmount, order.baseCurrency)}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className={`mb-3 ${ADMIN_SECTION_TITLE}`}>{d.totals}</h2>
          <p className="text-sm text-gray-700">
            {d.subtotal.replace(
              "{amount}",
              formatMoney(order.subtotalAmount, order.baseCurrency),
            )}
          </p>
          <p className="text-sm text-gray-700">{deliveryLabel}</p>
          <p className="text-sm text-gray-700">{couponLabel}</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {d.total.replace(
              "{amount}",
              formatMoney(order.totalAmount, order.baseCurrency),
            )}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {d.placedAt.replace(
              "{datetime}",
              order.placedAt.toISOString().slice(0, 16).replace("T", " "),
            )}
          </p>
        </Card>
      </div>

      <Card className={`mb-6 ${ADMIN_TABLE_CARD}`}>
        <div className="border-b border-gray-200 px-4 py-3 sm:px-5">
          <h2 className={ADMIN_SECTION_TITLE}>{d.lineItems}</h2>
        </div>
        <div className={ADMIN_TABLE_OUTER_SCROLL}>
          <table className={ADMIN_TABLE}>
            <thead className={ADMIN_TABLE_THEAD}>
              <tr>
                <th className={ADMIN_TABLE_TH}>{d.product}</th>
                <th className={ADMIN_TABLE_TH}>{d.qty}</th>
                <th className={ADMIN_TABLE_TH}>{d.lineTotal}</th>
              </tr>
            </thead>
            <tbody className={ADMIN_TABLE_TBODY}>
              {items.map((item) => (
                <tr key={item.id} className={ADMIN_TABLE_ROW}>
                  <td className={ADMIN_TABLE_TD}>
                    <p className="font-medium text-gray-900">
                      {item.productTitleSnapshot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.productSkuSnapshot}
                    </p>
                  </td>
                  <td className={ADMIN_TABLE_TD}>×{item.quantity}</td>
                  <td className={ADMIN_TABLE_TD}>
                    {formatMoney(item.lineTotalAmount, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className={`mb-4 ${ADMIN_SECTION_TITLE}`}>{d.history}</h2>
        <ol className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-gray-200 p-3 text-sm"
            >
              <p className="font-medium text-gray-900">
                {event.eventType}
                {event.fromState || event.toState
                  ? ` · ${event.fromState ?? "—"} → ${event.toState ?? "—"}`
                  : null}
              </p>
              <p className="text-gray-500">
                {event.createdAt.toISOString().slice(0, 19).replace("T", " ")}{" "}
                {copy.common.utc}
                {event.isCustomerVisible
                  ? ` · ${d.customerVisible}`
                  : ` · ${d.internal}`}
              </p>
              {event.payload &&
              typeof event.payload === "object" &&
              "note" in event.payload &&
              typeof event.payload.note === "string" ? (
                <p className="mt-1 text-gray-700">{event.payload.note}</p>
              ) : null}
            </li>
          ))}
          {events.length === 0 ? (
            <li className="text-sm text-gray-600">{d.noEvents}</li>
          ) : null}
        </ol>
      </Card>
    </section>
  );
}

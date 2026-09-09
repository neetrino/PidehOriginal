import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminPageHeading } from '@/features/admin/ui/AdminPageHeading';
import { listAdminGroupOrders } from '@/features/group-orders/application/queries';
import { adminGroupOrdersFilterSchema } from '@/features/group-orders/schemas';
import { AdminGroupOrdersFilters } from '@/features/group-orders/ui/AdminGroupOrdersFilters';
import { AdminGroupOrdersView } from '@/features/group-orders/ui/AdminGroupOrdersView';
import { requireAdmin } from '@/lib/auth/policies';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getSelectedCurrency } from '@/lib/money/display-price';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildGroupOrdersQuery(
  filters: {
    q?: string;
    status?: string;
    paymentMode?: string;
    page: number;
  },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status) params.set('status', filters.status);
  if (filters.paymentMode) params.set('paymentMode', filters.paymentMode);
  params.set('page', String(page));
  return params.toString();
}

export default async function AdminGroupOrdersPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;

  await requireAdmin(locale);
  const dictionary = getDictionary(locale);
  const copy = dictionary.admin.groupOrders;
  const currency = await getSelectedCurrency();

  const raw = await searchParams;
  const parsed = adminGroupOrdersFilterSchema.safeParse({
    status: firstParam(raw.status) || undefined,
    paymentMode: firstParam(raw.paymentMode) || undefined,
    q: firstParam(raw.q) || undefined,
    page: firstParam(raw.page) ?? '1',
  });

  const filters = parsed.success
    ? parsed.data
    : {
        page: 1 as const,
        status: undefined,
        paymentMode: undefined,
        q: undefined,
      };

  const { rows, total, pageSize } = await listAdminGroupOrders(filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section>
      <AdminPageHeading className="mb-6" title={copy.title} />

      <AdminGroupOrdersFilters
        total={total}
        status={filters.status}
        paymentMode={filters.paymentMode}
        q={filters.q}
        copy={copy}
      />

      <AdminGroupOrdersView locale={locale} currency={currency} rows={rows} copy={copy} />

      {totalPages > 1 ? (
        <nav className="mt-4 flex items-center gap-3 text-sm text-gray-700">
          {filters.page > 1 ? (
            <Link
              href={`/${locale}/admin/group-orders?${buildGroupOrdersQuery(filters, filters.page - 1)}`}
              className="font-medium hover:underline"
            >
              {dictionary.admin.common.previous}
            </Link>
          ) : null}
          <span>
            {dictionary.admin.common.pageOf
              .replace('{page}', String(filters.page))
              .replace('{totalPages}', String(totalPages))}
          </span>
          {filters.page < totalPages ? (
            <Link
              href={`/${locale}/admin/group-orders?${buildGroupOrdersQuery(filters, filters.page + 1)}`}
              className="font-medium hover:underline"
            >
              {dictionary.admin.common.next}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}

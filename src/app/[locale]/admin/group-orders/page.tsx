import { notFound, redirect } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';

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

/** Group orders now live on `/admin/orders?kind=group`. */
export default async function AdminGroupOrdersRedirect({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const raw = await searchParams;
  const query = new URLSearchParams();
  query.set('kind', 'group');

  const status = firstParam(raw.status);
  const paymentMode = firstParam(raw.paymentMode);
  const q = firstParam(raw.q);
  const page = firstParam(raw.page);
  if (status) query.set('status', status);
  if (paymentMode) query.set('paymentMode', paymentMode);
  if (q) query.set('q', q);
  if (page) query.set('page', page);

  redirect(`/${locale}/admin/orders?${query.toString()}`);
}

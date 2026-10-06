import { notFound } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';

import { CheckoutSuccessCard } from '@/features/checkout/ui/CheckoutSuccessCard';
import { getDb } from '@/db/client';
import { orders, payments } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth/session';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { defaultCurrency, isCurrency } from '@/lib/money/currency';
import { formatMoneyAmount } from '@/lib/money/format';

type SuccessPageProps = {
  params: Promise<{ locale: string; orderNumber: string }>;
};

export default async function CheckoutSuccessPage({ params }: SuccessPageProps) {
  const { locale, orderNumber } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const copy = dictionary.checkout.success;
  const user = await getCurrentUser();
  const [order] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  if (!order) {
    notFound();
  }

  if (order.userId && user && order.userId !== user.id && user.role !== 'ADMIN') {
    notFound();
  }

  const currency = isCurrency(order.baseCurrency) ? order.baseCurrency : defaultCurrency;

  let amountShown = order.totalAmount;
  let amountLabel = copy.total;
  if (order.groupOrderId) {
    const [payment] = await getDb()
      .select({ amount: payments.amount })
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .orderBy(desc(payments.attemptNumber))
      .limit(1);
    if (payment && payment.amount !== order.totalAmount) {
      amountShown = payment.amount;
      amountLabel = copy.amountPaid;
    }
  }

  const amountFormatted = formatMoneyAmount(amountShown, currency, locale);

  return (
    <CheckoutSuccessCard
      title={copy.title}
      body={copy.body}
      orderNumber={order.orderNumber}
      amountLabel={amountLabel}
      amountFormatted={amountFormatted}
      continueHref={`/${locale}/products`}
      continueLabel={copy.continueShopping}
      ordersHref={user ? `/${locale}/profile/orders` : null}
      ordersLabel={copy.viewOrders}
    />
  );
}

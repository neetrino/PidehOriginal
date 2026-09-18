import { isCurrency, currencySymbols } from '@/lib/money/currency';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type StatusLabels = Dictionary['admin']['orders']['statusLabels'];

/** Formats admin money as "2,334 ֏" style for the order drawer. */
export function formatOrderDrawerMoney(amount: number, currency: string): string {
  const symbol = isCurrency(currency) ? currencySymbols[currency] : currency;
  return `${amount.toLocaleString('en-US')} ${symbol}`;
}

/** Title-cases status tokens like PENDING → Pending. */
export function formatOrderStatusLabel(status: string): string {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/** Localized order/payment badge label for the order details drawer. */
export function orderDrawerStatusLabel(status: string, labels: StatusLabels): string {
  const normalized = status.toUpperCase();
  if (normalized === 'PENDING' || normalized === 'CONFIRMED' || normalized === 'AUTHORIZED') {
    return labels.pending;
  }
  if (normalized === 'PROCESSING' || normalized === 'SHIPPED') {
    return labels.processing;
  }
  if (normalized === 'DELIVERED') {
    return labels.completed;
  }
  if (normalized === 'CANCELLED' || normalized === 'REFUNDED') {
    return labels.cancelled;
  }
  if (normalized === 'CAPTURED' || normalized === 'PAID') {
    return labels.paid;
  }
  if (normalized === 'FAILED') {
    return labels.failed;
  }
  return formatOrderStatusLabel(status);
}

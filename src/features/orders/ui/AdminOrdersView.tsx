'use client';

import { BulkChangeOrderStatusForm } from '@/features/orders/ui/BulkChangeOrderStatusForm';
import {
  AdminOrderDetailsDrawerBind,
  useAdminOrderDetailsDrawer,
} from '@/features/orders/ui/useAdminOrderDetailsDrawer';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AdminOrdersViewOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  contactName: string;
  contactEmail: string;
  customerAdminComment: string | null;
  totalAmount: number;
  bonusRedeemedAmount: number;
  bonusEarnedAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
  isArchived: boolean;
  isAdminNew?: boolean;
};

type AdminOrdersViewProps = {
  locale: string;
  orders: AdminOrdersViewOrder[];
  copy: Dictionary['admin'];
};

export function AdminOrdersView({ locale, orders, copy }: AdminOrdersViewProps) {
  const drawer = useAdminOrderDetailsDrawer(locale);

  return (
    <>
      <BulkChangeOrderStatusForm
        locale={locale}
        orders={orders}
        onOpenOrder={drawer.openOrder}
        copy={copy}
      />
      <AdminOrderDetailsDrawerBind state={drawer} copy={copy} />
    </>
  );
}

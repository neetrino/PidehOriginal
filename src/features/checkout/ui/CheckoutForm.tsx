"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import { Card } from "@/components/ui/Card";
import type { CheckoutOrderProduct } from "@/features/checkout/ui/checkout-order-product";
import { previewCouponAction } from "@/features/checkout/application/preview-coupon";
import { createOrderAction } from "@/features/checkout/create-order";
import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CheckoutDetailsSections } from "@/features/checkout/ui/CheckoutDetailsSections";
import { CheckoutOrderSummary } from "@/features/checkout/ui/CheckoutOrderSummary";
import { CheckoutProductsInOrder } from "@/features/checkout/ui/CheckoutProductsInOrder";
import { useDistanceDeliveryQuote } from "@/features/checkout/ui/use-distance-delivery-quote";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import type { SelectedDeliverySlot } from "@/features/delivery/domain/delivery-schedule";
import type { CashChangeDenominationView } from "@/features/delivery/domain/cash-change";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

type CheckoutLabels = {
  title: string;
  productsInOrder: string;
  itemsOne: string;
  itemsMany: string;
  removeItem: string;
  contactInformation: string;
  shippingAddress: string;
  paymentMethod: string;
  orderSummary: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  floor: string;
  intercomCode: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  floorPlaceholder: string;
  intercomCodePlaceholder: string;
  openMap: string;
  mapTitle: string;
  mapHint: string;
  mapConfirm: string;
  mapCancel: string;
  mapResolving: string;
  enterDeliveryAddress: string;
  calculatingDelivery: string;
  scheduleTitle: string;
  schedulePickDate: string;
  schedulePickTime: string;
  scheduleNoSlots: string;
  schedulePrevMonth: string;
  scheduleNextMonth: string;
  selectDeliverySlot: string;
  selectCashChange: string;
  cashChangeTitle: string;
  cashChangeHint: string;
  cashChangeAria: string;
  cashOnDelivery: string;
  cashOnDeliveryDescription: string;
  idram: string;
  idramDescription: string;
  arca: string;
  arcaDescription: string;
  couponTitle: string;
  couponPlaceholder: string;
  couponApply: string;
  couponApplying: string;
  discount: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  placeOrder: string;
  processing: string;
  continueShopping: string;
  cartEmpty: string;
};

type CheckoutFormProps = {
  locale: Locale;
  labels: CheckoutLabels;
  productsHref: string;
  orderProducts: CheckoutOrderProduct[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
  defaultLine1: string;
  subtotalAmount: number;
  deliverySchedule: DeliveryScheduleSettings;
  cashChangeOptions: CashChangeDenominationView[];
  hasItems: boolean;
};

export function CheckoutForm({
  locale,
  labels,
  productsHref,
  orderProducts,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
  defaultLine1,
  subtotalAmount,
  deliverySchedule,
  cashChangeOptions,
  hasItems,
}: CheckoutFormProps) {
  const router = useRouter();
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const [line1, setLine1] = useState(defaultLine1);
  const [deliverySlot, setDeliverySlot] = useState<SelectedDeliverySlot | null>(
    null,
  );
  const [cashChangeAmount, setCashChangeAmount] = useState<number | null>(null);
  const deliveryQuote = useDistanceDeliveryQuote(line1);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cash_on_delivery");
  const [error, setError] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null,
  );
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [applyingCoupon, startApplyCoupon] = useTransition();

  const paymentOptions = useMemo(
    () => [
      {
        id: "cash_on_delivery" as const,
        name: labels.cashOnDelivery,
        description: labels.cashOnDeliveryDescription,
        logoSrc: null,
      },
      {
        id: "idram" as const,
        name: labels.idram,
        description: labels.idramDescription,
        logoSrc: "/assets/payments/idram.svg",
      },
      {
        id: "arca" as const,
        name: labels.arca,
        description: labels.arcaDescription,
        logoSrc: "/assets/payments/arca.svg",
      },
    ],
    [
      labels.arca,
      labels.arcaDescription,
      labels.cashOnDelivery,
      labels.cashOnDeliveryDescription,
      labels.idram,
      labels.idramDescription,
    ],
  );

  function formatMoney(amount: number): string {
    return formatMoneyAmount(amount, "AMD", locale);
  }

  const shippingAmount = deliveryQuote.deliveryAmount;
  const totalAmount =
    Math.max(0, subtotalAmount - discountAmount) + shippingAmount;

  const shippingFormatted = deliveryQuote.pending
    ? labels.calculatingDelivery
    : deliveryQuote.error
      ? labels.enterDeliveryAddress
      : deliveryQuote.distanceLabel
        ? `${formatMoney(shippingAmount)} (${deliveryQuote.distanceLabel})`
        : labels.enterDeliveryAddress;

  const deliveryQuoteHint =
    deliveryQuote.distanceLabel && !deliveryQuote.error
      ? `${deliveryQuote.distanceLabel} · ${formatMoney(shippingAmount)}`
      : null;

  function clearAppliedCoupon(): void {
    setAppliedCouponCode(null);
    setDiscountAmount(0);
  }

  function onCouponDraftChange(value: string): void {
    setCouponDraft(value);
    setCouponError(null);
    if (appliedCouponCode) {
      clearAppliedCoupon();
    }
  }

  function onApplyCoupon(): void {
    const code = couponDraft.trim();
    if (!code) {
      return;
    }

    setCouponError(null);
    startApplyCoupon(async () => {
      const result = await previewCouponAction({ couponCode: code });
      if (!result.ok) {
        clearAppliedCoupon();
        setCouponError(result.error);
        return;
      }

      setAppliedCouponCode(result.code);
      setCouponDraft(result.code);
      setDiscountAmount(result.discountAmount);
      setCouponError(null);
    });
  }

  if (!hasItems) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{labels.title}</h1>
        <Card className="rounded-2xl border border-gray-200/80 p-6 text-center shadow-none">
          <p className="mb-4 text-gray-600">{labels.cartEmpty}</p>
          <Link
            href={productsHref}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
          >
            {labels.continueShopping}
          </Link>
        </Card>
      </div>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);

    if (
      deliveryQuote.pending ||
      deliveryQuote.error ||
      !deliveryQuote.distanceLabel
    ) {
      setError(labels.enterDeliveryAddress);
      return;
    }

    if (!deliverySlot) {
      setError(labels.selectDeliverySlot);
      return;
    }

    if (
      paymentMethod === "cash_on_delivery" &&
      cashChangeOptions.length > 0 &&
      cashChangeAmount == null
    ) {
      setError(labels.selectCashChange);
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        locale,
        idempotencyKey,
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        contactEmail: String(data.get("contactEmail") ?? ""),
        contactPhone: String(data.get("contactPhone") ?? ""),
        shippingMethod: "delivery",
        paymentMethod,
        line1,
        floor: String(data.get("floor") ?? ""),
        intercomCode: String(data.get("intercomCode") ?? ""),
        scheduledDeliveryDate: deliverySlot.date,
        scheduledDeliveryStart: deliverySlot.startTime,
        scheduledDeliveryEnd: deliverySlot.endTime,
        cashChangeAmount:
          paymentMethod === "cash_on_delivery"
            ? (cashChangeAmount ?? undefined)
            : undefined,
        couponCode: appliedCouponCode ?? undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/${locale}/checkout/success/${result.orderNumber}`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">{labels.title}</h1>

      <CheckoutProductsInOrder
        products={orderProducts}
        title={labels.productsInOrder}
        itemsOneLabel={labels.itemsOne}
        itemsManyLabel={labels.itemsMany}
        removeItemLabel={labels.removeItem}
        onCartChanged={clearAppliedCoupon}
      />

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <CheckoutDetailsSections
            labels={labels}
            locale={locale}
            pending={pending}
            deliverySchedule={deliverySchedule}
            deliverySlot={deliverySlot}
            onDeliverySlotChange={setDeliverySlot}
            cashChangeOptions={cashChangeOptions}
            cashChangeAmount={cashChangeAmount}
            onCashChangeAmountChange={setCashChangeAmount}
            line1={line1}
            onLine1Change={setLine1}
            deliveryQuotePending={deliveryQuote.pending}
            deliveryQuoteError={deliveryQuote.error}
            deliveryQuoteHint={deliveryQuoteHint}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={(method) => {
              setPaymentMethod(method);
              if (method !== "cash_on_delivery") {
                setCashChangeAmount(null);
              }
            }}
            paymentOptions={paymentOptions}
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
            defaultEmail={defaultEmail}
            defaultPhone={defaultPhone}
          />

          <CheckoutOrderSummary
            title={labels.orderSummary}
            couponTitle={labels.couponTitle}
            couponPlaceholder={labels.couponPlaceholder}
            couponApplyLabel={labels.couponApply}
            couponApplyingLabel={labels.couponApplying}
            discountLabel={labels.discount}
            subtotalLabel={labels.subtotal}
            shippingLabel={labels.shipping}
            taxLabel={labels.tax}
            totalLabel={labels.total}
            subtotalFormatted={formatMoney(subtotalAmount)}
            shippingFormatted={shippingFormatted}
            taxFormatted={formatMoney(0)}
            discountFormatted={
              discountAmount > 0 ? formatMoney(discountAmount) : null
            }
            totalFormatted={formatMoney(totalAmount)}
            couponDraft={couponDraft}
            onCouponDraftChange={onCouponDraftChange}
            onApplyCoupon={onApplyCoupon}
            couponError={couponError}
            isApplyingCoupon={applyingCoupon}
            error={error}
            isSubmitting={pending}
            placeOrderLabel={labels.placeOrder}
            processingLabel={labels.processing}
          />
        </div>
      </form>
    </div>
  );
}

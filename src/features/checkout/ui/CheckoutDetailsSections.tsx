"use client";

import { Card } from "@/components/ui/Card";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { AddressMapPicker } from "@/components/ui/AddressMapPicker";
import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CashChangePicker } from "@/features/checkout/ui/CashChangePicker";
import { CheckoutPaymentMethods } from "@/features/checkout/ui/CheckoutPaymentMethods";
import { DeliverySlotPicker } from "@/features/checkout/ui/DeliverySlotPicker";
import type { CashChangeDenominationView } from "@/features/delivery/domain/cash-change";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import type { SelectedDeliverySlot } from "@/features/delivery/domain/delivery-schedule";
import type { Locale } from "@/lib/i18n/config";

const FIELD_CLASS =
  "h-11 w-full rounded-2xl border border-gray-200 px-4 text-gray-900 shadow-sm outline-none transition-colors hover:border-gray-300 focus:border-gray-300 disabled:bg-gray-50";

type CheckoutDetailsLabels = {
  contactInformation: string;
  shippingAddress: string;
  paymentMethod: string;
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
  calculatingDelivery: string;
  scheduleTitle: string;
  schedulePickDate: string;
  schedulePickTime: string;
  scheduleNoSlots: string;
  schedulePrevMonth: string;
  scheduleNextMonth: string;
  cashChangeTitle: string;
  cashChangeHint: string;
  cashChangeAria: string;
};

type PaymentOption = {
  id: CheckoutPaymentMethod;
  name: string;
  description: string;
  logoSrc: string | null;
};

type CheckoutDetailsSectionsProps = {
  labels: CheckoutDetailsLabels;
  locale: Locale;
  pending: boolean;
  deliverySchedule: DeliveryScheduleSettings;
  deliverySlot: SelectedDeliverySlot | null;
  onDeliverySlotChange: (value: SelectedDeliverySlot | null) => void;
  cashChangeOptions: CashChangeDenominationView[];
  cashChangeAmount: number | null;
  onCashChangeAmountChange: (amount: number) => void;
  line1: string;
  onLine1Change: (value: string) => void;
  deliveryQuotePending: boolean;
  deliveryQuoteError: string | null;
  deliveryQuoteHint: string | null;
  paymentMethod: CheckoutPaymentMethod;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  paymentOptions: PaymentOption[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
};

export function CheckoutDetailsSections({
  labels,
  locale,
  pending,
  deliverySchedule,
  deliverySlot,
  onDeliverySlotChange,
  cashChangeOptions,
  cashChangeAmount,
  onCashChangeAmountChange,
  line1,
  onLine1Change,
  deliveryQuotePending,
  deliveryQuoteError,
  deliveryQuoteHint,
  paymentMethod,
  onPaymentMethodChange,
  paymentOptions,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
}: CheckoutDetailsSectionsProps) {
  return (
    <div className="space-y-6 lg:col-span-2">
      <Card className="rounded-2xl border border-gray-200/80 p-6 shadow-none">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          {labels.contactInformation}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.firstName}
              <input
                name="firstName"
                required
                defaultValue={defaultFirstName}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="given-name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.lastName}
              <input
                name="lastName"
                required
                defaultValue={defaultLastName}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="family-name"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.email}
              <input
                name="contactEmail"
                type="email"
                required
                defaultValue={defaultEmail}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="email"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.phone}
              <input
                name="contactPhone"
                required
                defaultValue={defaultPhone}
                placeholder={labels.phonePlaceholder}
                disabled={pending}
                className={FIELD_CLASS}
                autoComplete="tel"
              />
            </label>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-200/80 p-6 shadow-none">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">
          {labels.shippingAddress}
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-gray-700">
              {labels.address}
            </span>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <AddressAutocomplete
                  name="line1"
                  required
                  value={line1}
                  onValueChange={onLine1Change}
                  placeholder={labels.addressPlaceholder}
                  disabled={pending}
                  className={FIELD_CLASS}
                  languageCode={locale}
                />
              </div>
              <AddressMapPicker
                addressValue={line1}
                disabled={pending}
                onAddressSelected={onLine1Change}
                labels={{
                  openMap: labels.openMap,
                  title: labels.mapTitle,
                  hint: labels.mapHint,
                  confirm: labels.mapConfirm,
                  cancel: labels.mapCancel,
                  resolving: labels.mapResolving,
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.floor}
              <input
                name="floor"
                disabled={pending}
                placeholder={labels.floorPlaceholder}
                className={FIELD_CLASS}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
              {labels.intercomCode}
              <input
                name="intercomCode"
                disabled={pending}
                placeholder={labels.intercomCodePlaceholder}
                className={FIELD_CLASS}
              />
            </label>
          </div>
          <DeliverySlotPicker
            schedule={deliverySchedule}
            selected={deliverySlot}
            onChange={onDeliverySlotChange}
            disabled={pending}
            locale={locale}
            labels={{
              title: labels.scheduleTitle,
              pickDate: labels.schedulePickDate,
              pickTime: labels.schedulePickTime,
              noSlots: labels.scheduleNoSlots,
              prevMonth: labels.schedulePrevMonth,
              nextMonth: labels.scheduleNextMonth,
            }}
          />
          {paymentMethod === "cash_on_delivery" ? (
            <CashChangePicker
              options={cashChangeOptions}
              value={cashChangeAmount}
              onChange={onCashChangeAmountChange}
              disabled={pending}
              locale={locale}
              labels={{
                title: labels.cashChangeTitle,
                hint: labels.cashChangeHint,
                ariaLabel: labels.cashChangeAria,
              }}
            />
          ) : null}
        </div>
        {deliveryQuotePending ? (
          <p className="mt-2 text-sm text-gray-500">
            {labels.calculatingDelivery}
          </p>
        ) : null}
        {deliveryQuoteError ? (
          <p className="mt-2 text-sm text-red-700">{deliveryQuoteError}</p>
        ) : null}
        {!deliveryQuotePending && !deliveryQuoteError && deliveryQuoteHint ? (
          <p className="mt-2 text-sm text-gray-600">{deliveryQuoteHint}</p>
        ) : null}
      </Card>

      <CheckoutPaymentMethods
        title={labels.paymentMethod}
        options={paymentOptions}
        value={paymentMethod}
        onChange={onPaymentMethodChange}
        disabled={pending}
      />
    </div>
  );
}

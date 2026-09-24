'use client';

import {
  CHECKOUT_FIELD,
  CHECKOUT_LABEL,
  CHECKOUT_PANEL,
  CHECKOUT_SECTION_TITLE,
} from '@/features/checkout/ui/checkout-ui-classes';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { AddressMapPicker } from '@/components/ui/AddressMapPicker';
import type { CheckoutPaymentMethod } from '@/features/checkout/domain/payment-methods';
import type { CheckoutShippingMethod } from '@/features/checkout/domain/shipping-methods';
import { CashChangePicker } from '@/features/checkout/ui/CashChangePicker';
import {
  CheckoutPaymentMethods,
  type PaymentOption,
} from '@/features/checkout/ui/CheckoutPaymentMethods';
import { CheckoutShippingMethods } from '@/features/checkout/ui/CheckoutShippingMethods';
import { DeliverySlotPicker } from '@/features/checkout/ui/DeliverySlotPicker';
import type { CashChangeDenominationView } from '@/features/delivery/domain/cash-change';
import type { DeliveryScheduleSettings } from '@/features/delivery/domain/delivery-schedule';
import type { SelectedDeliverySlot } from '@/features/delivery/domain/delivery-schedule';
import type { Locale } from '@/lib/i18n/config';

type CheckoutDetailsLabels = {
  contactInformation: string;
  shippingMethod: string;
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
  cashChangeNotNeeded: string;
  pickupStoreHint: string;
};

type ShippingOption = {
  id: CheckoutShippingMethod;
  name: string;
  description: string;
};

type CheckoutDetailsSectionsProps = {
  labels: CheckoutDetailsLabels;
  locale: Locale;
  pending: boolean;
  shippingMethod: CheckoutShippingMethod;
  onShippingMethodChange: (method: CheckoutShippingMethod) => void;
  shippingOptions: ShippingOption[];
  storePickupAddress: string | null;
  deliverySchedule: DeliveryScheduleSettings;
  deliverySlot: SelectedDeliverySlot | null;
  onDeliverySlotChange: (value: SelectedDeliverySlot | null) => void;
  cashChangeOptions: CashChangeDenominationView[];
  cashChangeAmount: number | null;
  onCashChangeAmountChange: (amount: number) => void;
  line1: string;
  onLine1Change: (value: string) => void;
  onMapAddressSelected: (address: string, point: { lat: number; lng: number }) => void;
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
  shippingMethod,
  onShippingMethodChange,
  shippingOptions,
  storePickupAddress,
  deliverySchedule,
  deliverySlot,
  onDeliverySlotChange,
  cashChangeOptions,
  cashChangeAmount,
  onCashChangeAmountChange,
  line1,
  onLine1Change,
  onMapAddressSelected,
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
  const isDelivery = shippingMethod === 'delivery';

  return (
    <div className="space-y-6 lg:col-span-2">
      <section className={CHECKOUT_PANEL}>
        <h2 className={CHECKOUT_SECTION_TITLE}>{labels.contactInformation}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={CHECKOUT_LABEL}>
              {labels.firstName}
              <input
                name="firstName"
                required
                defaultValue={defaultFirstName}
                disabled={pending}
                className={CHECKOUT_FIELD}
                autoComplete="given-name"
              />
            </label>
            <label className={CHECKOUT_LABEL}>
              {labels.lastName}
              <input
                name="lastName"
                required
                defaultValue={defaultLastName}
                disabled={pending}
                className={CHECKOUT_FIELD}
                autoComplete="family-name"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={CHECKOUT_LABEL}>
              {labels.email}
              <input
                name="contactEmail"
                type="email"
                required
                defaultValue={defaultEmail}
                disabled={pending}
                className={CHECKOUT_FIELD}
                autoComplete="email"
              />
            </label>
            <label className={CHECKOUT_LABEL}>
              {labels.phone}
              <input
                name="contactPhone"
                required
                defaultValue={defaultPhone}
                placeholder={labels.phonePlaceholder}
                disabled={pending}
                className={CHECKOUT_FIELD}
                autoComplete="tel"
              />
            </label>
          </div>
        </div>
      </section>

      <CheckoutShippingMethods
        title={labels.shippingMethod}
        options={shippingOptions}
        value={shippingMethod}
        onChange={onShippingMethodChange}
        disabled={pending}
      />

      <section className={CHECKOUT_PANEL}>
        <h2 className={CHECKOUT_SECTION_TITLE}>{labels.shippingAddress}</h2>
        <div className="space-y-4">
          {isDelivery ? (
            <>
              <div className="space-y-1.5">
                <span className="text-sm font-bold text-[#1e1e1e]">{labels.address}</span>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <AddressAutocomplete
                      name="line1"
                      required
                      value={line1}
                      onValueChange={onLine1Change}
                      placeholder={labels.addressPlaceholder}
                      disabled={pending}
                      className={CHECKOUT_FIELD}
                      languageCode={locale}
                    />
                  </div>
                  <AddressMapPicker
                    addressValue={line1}
                    disabled={pending}
                    onAddressSelected={onMapAddressSelected}
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
                <label className={CHECKOUT_LABEL}>
                  {labels.floor}
                  <input
                    name="floor"
                    disabled={pending}
                    placeholder={labels.floorPlaceholder}
                    className={CHECKOUT_FIELD}
                  />
                </label>
                <label className={CHECKOUT_LABEL}>
                  {labels.intercomCode}
                  <input
                    name="intercomCode"
                    disabled={pending}
                    placeholder={labels.intercomCodePlaceholder}
                    className={CHECKOUT_FIELD}
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
            </>
          ) : (
            <p className="text-sm text-[#1e1e1e]/65">
              {storePickupAddress
                ? `${labels.pickupStoreHint} ${storePickupAddress}`
                : labels.pickupStoreHint}
            </p>
          )}
          {paymentMethod === 'cash_on_delivery' ? (
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
                notNeeded: labels.cashChangeNotNeeded,
              }}
            />
          ) : null}
        </div>
        {isDelivery && deliveryQuotePending ? (
          <p className="mt-2 text-sm text-[#1e1e1e]/55">{labels.calculatingDelivery}</p>
        ) : null}
        {isDelivery && deliveryQuoteError ? (
          <p className="mt-2 text-sm text-red-700">{deliveryQuoteError}</p>
        ) : null}
        {isDelivery && !deliveryQuotePending && !deliveryQuoteError && deliveryQuoteHint ? (
          <p className="mt-2 text-sm text-[#1e1e1e]/65">{deliveryQuoteHint}</p>
        ) : null}
      </section>

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

"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { saveDeliverySettingsAction } from "@/features/delivery/application/save-delivery-settings";
import type { CashChangeDenomination } from "@/features/delivery/domain/cash-change";
import type { StoreDeliverySettings } from "@/features/delivery/domain/delivery-settings";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import { timeToMinutes } from "@/features/delivery/domain/delivery-schedule";
import { AdminCashChangeEditor } from "@/features/delivery/ui/AdminCashChangeEditor";
import { AdminDeliveryScheduleEditor } from "@/features/delivery/ui/AdminDeliveryScheduleEditor";
import { formatMoneyAmount } from "@/lib/money/format";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminDeliveryViewCopy = {
  delivery: Dictionary["admin"]["delivery"];
  common: Dictionary["admin"]["common"];
};

type AdminDeliveryViewProps = {
  locale: string;
  settings: StoreDeliverySettings;
  initialImageUrls: Record<string, string>;
  copy: AdminDeliveryViewCopy;
};

function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function normalizeScheduleForSave(
  schedule: DeliveryScheduleSettings,
): DeliveryScheduleSettings["weekly"] {
  const weekly = { ...schedule.weekly };
  for (const day of [1, 2, 3, 4, 5, 6, 7] as const) {
    const hours = weekly[day];
    if (!hours.isOpen) continue;
    const openMinutes = timeToMinutes(hours.openTime);
    const closeMinutes = timeToMinutes(hours.closeTime);
    if (closeMinutes > openMinutes) continue;
    const preferredClose = openMinutes + 60;
    weekly[day] =
      preferredClose <= 23 * 60 + 59
        ? { ...hours, closeTime: minutesToTime(preferredClose) }
        : {
            ...hours,
            openTime: minutesToTime(Math.max(0, closeMinutes - 60)),
          };
  }
  return weekly;
}

export function AdminDeliveryView({
  locale,
  settings,
  initialImageUrls,
  copy,
}: AdminDeliveryViewProps) {
  const [originAddress, setOriginAddress] = useState(settings.originAddress);
  const [originLat, setOriginLat] = useState(settings.originLat);
  const [originLng, setOriginLng] = useState(settings.originLng);
  const [pricePerKmAmount, setPricePerKmAmount] = useState(
    settings.pricePerKmAmount > 0 ? String(settings.pricePerKmAmount) : "",
  );
  const [isActive, setIsActive] = useState(settings.isActive);
  const [schedule, setSchedule] = useState<DeliveryScheduleSettings>(
    settings.schedule,
  );
  const [cashChangeDenominations, setCashChangeDenominations] = useState<
    CashChangeDenomination[]
  >(settings.cashChangeDenominations);
  const [imageUrls, setImageUrls] = useState(initialImageUrls);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const languageCode: Locale = isLocale(locale) ? locale : "hy";

  const sortedDenominations = useMemo(
    () =>
      [...cashChangeDenominations].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.amount - b.amount,
      ),
    [cashChangeDenominations],
  );

  function onSave(): void {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const weekly = normalizeScheduleForSave(schedule);
      setSchedule({ ...schedule, weekly });
      const result = await saveDeliverySettingsAction(locale, {
        originAddress,
        pricePerKmAmount: Number(pricePerKmAmount),
        isActive,
        schedule: {
          slotMinutes: schedule.slotMinutes,
          maxDaysAhead: schedule.maxDaysAhead,
          weekly,
          closedDates: schedule.closedDates,
        },
        cashChangeDenominations: sortedDenominations.map((item, index) => ({
          ...item,
          sortOrder: index,
        })),
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setOriginAddress(result.value.originAddress);
      setOriginLat(result.value.originLat);
      setOriginLng(result.value.originLng);
      setMessage(copy.delivery.saved);
    });
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{copy.delivery.title}</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>{copy.delivery.subtitle}</p>
      </div>

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-green-700">{message}</p> : null}

      <form
        className="grid gap-6 xl:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <Card className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {copy.delivery.storeAndPricing}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {copy.delivery.storeAndPricingHint}
              </p>
            </div>

            <label>
              <span className={ADMIN_LABEL}>{copy.delivery.storeAddress}</span>
              <AddressAutocomplete
                value={originAddress}
                onValueChange={setOriginAddress}
                placeholder={copy.delivery.storeAddressPlaceholder}
                required
                className={ADMIN_INPUT}
                disabled={isPending}
                languageCode={languageCode}
              />
              <span className="mt-1 block text-xs text-gray-500">
                {copy.delivery.storeAddressHint}
              </span>
              {originLat != null && originLng != null ? (
                <span className="mt-1 block text-xs text-gray-500">
                  {copy.delivery.geocoded
                    .replace("{lat}", originLat.toFixed(5))
                    .replace("{lng}", originLng.toFixed(5))}
                </span>
              ) : null}
            </label>

            <label>
              <span className={ADMIN_LABEL}>{copy.delivery.pricePerKm}</span>
              <input
                type="number"
                min={0}
                step={1}
                required
                value={pricePerKmAmount}
                onChange={(event) => setPricePerKmAmount(event.target.value)}
                placeholder={copy.delivery.pricePerKmPlaceholder}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
              {pricePerKmAmount !== "" &&
              Number.isFinite(Number(pricePerKmAmount)) ? (
                <span className="mt-1 block text-xs text-gray-500">
                  {copy.delivery.pricePerKmExample.replace(
                    "{amount}",
                    formatMoneyAmount(
                      Math.round((1101 * Number(pricePerKmAmount)) / 1000),
                      "AMD",
                      locale,
                    ),
                  )}
                </span>
              ) : null}
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-gray-300"
              />
              {copy.delivery.offerDelivery}
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-5">
            <AdminDeliveryScheduleEditor
              value={schedule}
              onChange={setSchedule}
              disabled={isPending}
              copy={copy.delivery.schedule}
            />
          </div>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <AdminCashChangeEditor
            locale={locale}
            value={sortedDenominations}
            imageUrls={imageUrls}
            onChange={setCashChangeDenominations}
            onImageUrlsChange={setImageUrls}
            disabled={isPending}
            copy={copy.delivery.cashChange}
          />
          <div className="mt-5">
            <Button type="submit" disabled={isPending}>
              {isPending ? copy.common.saving : copy.common.save}
            </Button>
          </div>
        </Card>
      </form>
    </section>
  );
}

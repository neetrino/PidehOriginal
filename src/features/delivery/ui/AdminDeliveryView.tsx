'use client';

import { useMemo, useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AdminPageHeading } from '@/features/admin/ui/AdminPageHeading';
import { saveDeliverySettingsAction } from '@/features/delivery/application/save-delivery-settings';
import type { CashChangeDenomination } from '@/features/delivery/domain/cash-change';
import type { StoreDeliverySettings } from '@/features/delivery/domain/delivery-settings';
import type { DeliveryScheduleSettings } from '@/features/delivery/domain/delivery-schedule';
import { timeToMinutes } from '@/features/delivery/domain/delivery-schedule';
import type { AdminDeliveryLocation } from '@/features/delivery/application/queries';
import { AdminCashChangeEditor } from '@/features/delivery/ui/AdminCashChangeEditor';
import { AdminDeliveryLocations } from '@/features/delivery/ui/AdminDeliveryLocations';
import { AdminDeliveryScheduleEditor } from '@/features/delivery/ui/AdminDeliveryScheduleEditor';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type AdminDeliveryViewCopy = {
  delivery: Dictionary['admin']['delivery'];
  common: Dictionary['admin']['common'];
};

type AdminDeliveryViewProps = {
  locale: string;
  settings: StoreDeliverySettings;
  locations: AdminDeliveryLocation[];
  initialImageUrls: Record<string, string>;
  copy: AdminDeliveryViewCopy;
};

function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function normalizeScheduleForSave(
  schedule: DeliveryScheduleSettings,
): DeliveryScheduleSettings['weekly'] {
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
  locations,
  initialImageUrls,
  copy,
}: AdminDeliveryViewProps) {
  const [schedule, setSchedule] = useState<DeliveryScheduleSettings>(settings.schedule);
  const [cashChangeDenominations, setCashChangeDenominations] = useState<CashChangeDenomination[]>(
    settings.cashChangeDenominations,
  );
  const [imageUrls, setImageUrls] = useState(initialImageUrls);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sortedDenominations = useMemo(
    () =>
      [...cashChangeDenominations].sort((a, b) => a.sortOrder - b.sortOrder || a.amount - b.amount),
    [cashChangeDenominations],
  );

  function onSave(): void {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const weekly = normalizeScheduleForSave(schedule);
      setSchedule({ ...schedule, weekly });
      const result = await saveDeliverySettingsAction(locale, {
        originAddress: settings.originAddress,
        originLat: settings.originLat,
        originLng: settings.originLng,
        pricePerKmAmount: settings.pricePerKmAmount,
        isActive: true,
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
      setMessage(copy.delivery.saved);
    });
  }

  return (
    <section>
      <AdminPageHeading
        className="mb-6"
        title={copy.delivery.title}
        description={copy.delivery.subtitle}
      />

      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mb-3 text-sm text-green-700">{message}</p> : null}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <Card className="p-6">
            <div className="flex flex-col gap-5">
              <AdminDeliveryScheduleEditor
                locale={locale}
                value={schedule}
                onChange={setSchedule}
                disabled={isPending}
                copy={copy.delivery.schedule}
              />
              <div>
                <Button type="submit" disabled={isPending}>
                  {isPending ? copy.common.saving : copy.common.save}
                </Button>
              </div>
            </div>
          </Card>
        </form>

        <AdminDeliveryLocations locale={locale} locations={locations} copy={copy} />

        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
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
      </div>
    </section>
  );
}

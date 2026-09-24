'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  buildMonthCells,
  monthLabel,
  parseYmd,
  startOfMonthYmd,
  weekdayLabels,
} from '@/features/checkout/ui/delivery-slot-calendar';
import {
  formatYerevanDate,
  listAvailableDeliveryDays,
  type DeliveryScheduleSettings,
  type SelectedDeliverySlot,
} from '@/features/delivery/domain/delivery-schedule';

type DeliverySlotPickerLabels = {
  title: string;
  pickDate: string;
  pickTime: string;
  noSlots: string;
  prevMonth: string;
  nextMonth: string;
};

type DeliverySlotPickerProps = {
  schedule: DeliveryScheduleSettings;
  selected: SelectedDeliverySlot | null;
  onChange: (value: SelectedDeliverySlot | null) => void;
  disabled?: boolean;
  labels: DeliverySlotPickerLabels;
  locale: string;
};

const NAV_BUTTON =
  'inline-flex size-9 items-center justify-center rounded-full border border-[#ff6b00]/25 bg-white text-[#ff6b00] transition-colors hover:bg-[#ffd54a] disabled:cursor-not-allowed disabled:opacity-35';

function dayClass(isSelected: boolean, bookable: boolean, isToday: boolean): string {
  if (isSelected) {
    return 'bg-[#ff6b00] font-bold text-white';
  }
  if (bookable && isToday) {
    return 'bg-[#ffd54a] font-bold text-[#1e1e1e] hover:bg-[#ff6b00] hover:text-white';
  }
  if (bookable) {
    return 'bg-white font-bold text-[#1e1e1e] ring-1 ring-[#ff6b00]/30 hover:bg-[#ffd54a]';
  }
  return 'cursor-not-allowed font-medium text-[#1e1e1e]/22';
}

function timeClass(isSelected: boolean): string {
  if (isSelected) {
    return 'border-[#ff6b00] bg-[#ff6b00] text-white';
  }
  return 'border-[#ff6b00]/20 bg-white text-[#1e1e1e] hover:border-[#ff6b00] hover:bg-[#ffd54a]';
}

/**
 * Calendar + time-slot picker for checkout delivery scheduling.
 */
export function DeliverySlotPicker({
  schedule,
  selected,
  onChange,
  disabled = false,
  labels,
  locale,
}: DeliverySlotPickerProps) {
  const availableDays = useMemo(() => listAvailableDeliveryDays(schedule), [schedule]);
  const availableByDate = useMemo(() => {
    const map = new Map<string, (typeof availableDays)[number]>();
    for (const day of availableDays) {
      map.set(day.date, day);
    }
    return map;
  }, [availableDays]);

  const todayYmd = formatYerevanDate(new Date());
  const todayParts = parseYmd(todayYmd);
  const [viewYear, setViewYear] = useState(todayParts.year);
  const [viewMonth, setViewMonth] = useState(todayParts.monthIndex);
  const selectedDay = selected ? (availableByDate.get(selected.date) ?? null) : null;
  const weekdays = weekdayLabels(locale);
  const cells = buildMonthCells(viewYear, viewMonth);

  const maxDate = availableDays[availableDays.length - 1]?.date ?? todayYmd;
  const maxParts = parseYmd(maxDate);
  const viewMonthYmd = startOfMonthYmd(viewYear, viewMonth);
  const canPrev = viewMonthYmd > startOfMonthYmd(todayParts.year, todayParts.monthIndex);
  const canNext = viewMonthYmd < startOfMonthYmd(maxParts.year, maxParts.monthIndex);

  function selectDate(date: string): void {
    const day = availableByDate.get(date);
    const first = day?.slots[0];
    if (!day || !first || disabled) {
      return;
    }
    onChange({ date, startTime: first.startTime, endTime: first.endTime });
  }

  function shiftMonth(delta: number): void {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#ff6b00]/15 bg-white">
      <div className="border-b border-[#ff6b00]/10 bg-[#fff8e7] px-4 py-3.5 sm:px-5">
        <h3 className="font-display text-xl leading-none text-[#1e1e1e] uppercase">{labels.title}</h3>
      </div>

      {availableDays.length === 0 ? (
        <p className="px-4 py-4 text-sm text-red-700 sm:px-5">{labels.noSlots}</p>
      ) : (
        <div className="space-y-5 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={disabled || !canPrev}
              onClick={() => shiftMonth(-1)}
              className={NAV_BUTTON}
              aria-label={labels.prevMonth}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="font-display text-lg leading-none text-[#1e1e1e] uppercase">
              {monthLabel(viewYear, viewMonth, locale)}
            </p>
            <button
              type="button"
              disabled={disabled || !canNext}
              onClick={() => shiftMonth(1)}
              className={NAV_BUTTON}
              aria-label={labels.nextMonth}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>

          <div>
            <p className="mb-3 font-display text-sm leading-none tracking-wide text-[#ff6b00] uppercase">
              {labels.pickDate}
            </p>
            <div className="grid grid-cols-7 gap-y-1.5 text-center">
              {weekdays.map((label) => (
                <div key={label} className="pb-1 text-[11px] font-bold text-[#1e1e1e]/45 sm:text-xs">
                  {label}
                </div>
              ))}
              {cells.map((date, index) =>
                date ? (
                  <button
                    key={date}
                    type="button"
                    disabled={disabled || !availableByDate.has(date)}
                    onClick={() => selectDate(date)}
                    className={`mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-colors sm:size-10 ${dayClass(
                      selected?.date === date,
                      availableByDate.has(date),
                      selected == null && date === todayYmd,
                    )}`}
                  >
                    {Number(date.slice(-2))}
                  </button>
                ) : (
                  <div key={`blank-${index}`} />
                ),
              )}
            </div>
          </div>

          <div className="border-t border-[#ff6b00]/10 pt-4">
            <p className="mb-3 font-display text-sm leading-none tracking-wide text-[#ff6b00] uppercase">
              {labels.pickTime}
            </p>
            {selectedDay ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {selectedDay.slots.map((slot) => {
                  const isSelected =
                    selected?.startTime === slot.startTime && selected?.endTime === slot.endTime;
                  return (
                    <button
                      key={slot.label}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        onChange({
                          date: selectedDay.date,
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                        })
                      }
                      className={`h-10 rounded-full border text-sm font-bold transition-colors ${timeClass(isSelected)}`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl bg-[#fff8e7] px-3 py-2.5 text-sm text-[#1e1e1e]/65">
                {labels.pickDate}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

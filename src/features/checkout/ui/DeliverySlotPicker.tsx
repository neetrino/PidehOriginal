"use client";

import { useMemo, useState } from "react";

import {
  formatYerevanDate,
  listAvailableDeliveryDays,
  type DeliveryScheduleSettings,
  type SelectedDeliverySlot,
} from "@/features/delivery/domain/delivery-schedule";

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

function startOfMonthYmd(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function parseYmd(ymd: string): { year: number; monthIndex: number; day: number } {
  const [yearText, monthText, dayText] = ymd.split("-");
  return {
    year: Number(yearText),
    monthIndex: Number(monthText) - 1,
    day: Number(dayText),
  };
}

/**
 * Fixed month names — avoid `Intl.DateTimeFormat` here: Node ICU and browsers
 * disagree for `hy` (SSR: "2026 թ․ հուլիս", client: "July 2026"), which
 * causes a hydration mismatch.
 */
const MONTH_NAMES: Record<string, readonly string[]> = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  hy: [
    "հունվար",
    "փետրվար",
    "մարտ",
    "ապրիլ",
    "մայիս",
    "հունիս",
    "հուլիս",
    "օգոստոս",
    "սեպտեմբեր",
    "հոկտեմբեր",
    "նոյեմբեր",
    "դեկտեմբեր",
  ],
  ru: [
    "январь",
    "февраль",
    "март",
    "апрель",
    "май",
    "июнь",
    "июль",
    "август",
    "сентябрь",
    "октябрь",
    "ноябрь",
    "декабрь",
  ],
};

function monthLabel(year: number, monthIndex: number, locale: string): string {
  const months = MONTH_NAMES[locale] ?? MONTH_NAMES.en;
  const month = months[monthIndex] ?? months[0] ?? "";
  return `${month} ${year}`;
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
  const availableDays = useMemo(
    () => listAvailableDeliveryDays(schedule),
    [schedule],
  );
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

  const selectedDay = selected
    ? availableByDate.get(selected.date) ?? null
    : null;

  function selectDate(date: string): void {
    const day = availableByDate.get(date);
    if (!day || disabled) return;
    const first = day.slots[0];
    if (!first) {
      onChange(null);
      return;
    }
    onChange({
      date,
      startTime: first.startTime,
      endTime: first.endTime,
    });
  }

  function shiftMonth(delta: number): void {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstWeekday = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const cells: Array<string | null> = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }),
  ];

  const maxDate =
    availableDays.length > 0
      ? availableDays[availableDays.length - 1]?.date
      : todayYmd;
  const minMonth = startOfMonthYmd(todayParts.year, todayParts.monthIndex);
  const maxParts = parseYmd(maxDate ?? todayYmd);
  const maxMonth = startOfMonthYmd(maxParts.year, maxParts.monthIndex);
  const viewMonthYmd = startOfMonthYmd(viewYear, viewMonth);
  const canPrev = viewMonthYmd > minMonth;
  const canNext = viewMonthYmd < maxMonth;

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900">{labels.title}</h3>

      {availableDays.length === 0 ? (
        <p className="text-sm text-red-700">{labels.noSlots}</p>
      ) : (
        <>
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled={disabled || !canPrev}
                onClick={() => shiftMonth(-1)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-40"
              >
                {labels.prevMonth}
              </button>
              <p className="text-sm font-medium text-gray-900">
                {monthLabel(viewYear, viewMonth, locale)}
              </p>
              <button
                type="button"
                disabled={disabled || !canNext}
                onClick={() => shiftMonth(1)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-40"
              >
                {labels.nextMonth}
              </button>
            </div>

            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              {labels.pickDate}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                <div key={label} className="py-1 font-medium">
                  {label}
                </div>
              ))}
              {cells.map((date, index) => {
                if (!date) {
                  return <div key={`blank-${index}`} />;
                }
                const bookable = availableByDate.has(date);
                const isSelected = selected?.date === date;
                return (
                  <button
                    key={date}
                    type="button"
                    disabled={disabled || !bookable}
                    onClick={() => selectDate(date)}
                    className={`h-10 rounded-xl text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-gray-900 text-white"
                        : bookable
                          ? "bg-gray-50 text-gray-900 hover:bg-gray-100"
                          : "cursor-not-allowed text-gray-300"
                    }`}
                  >
                    {Number(date.slice(-2))}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              {labels.pickTime}
            </p>
            {selectedDay ? (
              <div className="flex flex-wrap gap-2">
                {selectedDay.slots.map((slot) => {
                  const isSelected =
                    selected?.startTime === slot.startTime &&
                    selected?.endTime === slot.endTime;
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
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{labels.pickDate}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { ADMIN_INPUT } from '@/features/admin/ui/admin-form-classes';
import {
  buildMonthCells,
  formatCalendarDate,
  monthLabel,
  parseYmd,
  weekdayLabels,
} from '@/features/checkout/ui/delivery-slot-calendar';
import { formatYerevanDate } from '@/features/delivery/domain/delivery-schedule';

type AdminDateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  locale: string;
  placeholder: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
};

const NAV_BUTTON =
  'inline-flex size-7 items-center justify-center rounded-full border border-[#ff6b00]/25 bg-white text-[#ff6b00] transition-colors hover:bg-[#ffd54a]';

function dayClass(isSelected: boolean, isToday: boolean): string {
  if (isSelected) return 'bg-[#ff6b00] font-bold text-white';
  if (isToday) return 'bg-[#ffd54a] font-bold text-[#1e1e1e] hover:bg-[#ff6b00] hover:text-white';
  return 'font-medium text-[#1e1e1e] hover:bg-[#fff4cc]';
}

function shiftView(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const next = new Date(Date.UTC(year, monthIndex + delta, 1));
  return { year: next.getUTCFullYear(), monthIndex: next.getUTCMonth() };
}

type CalendarPanelProps = {
  locale: string;
  value: string;
  today: string;
  viewYear: number;
  viewMonth: number;
  placeholder: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  onMoveMonth: (delta: number) => void;
  onPick: (date: string) => void;
};

function CalendarPanel({
  locale,
  value,
  today,
  viewYear,
  viewMonth,
  placeholder,
  prevMonthLabel,
  nextMonthLabel,
  onMoveMonth,
  onPick,
}: CalendarPanelProps) {
  const cells = buildMonthCells(viewYear, viewMonth);

  return (
    <div
      role="dialog"
      aria-label={placeholder}
      className="absolute z-30 mt-2 w-[17.5rem] rounded-[22px] border border-[#ff6b00]/15 bg-white p-3 shadow-lg"
    >
      <div className="mb-1 flex items-center justify-between gap-1">
        <button
          type="button"
          className={NAV_BUTTON}
          aria-label={prevMonthLabel}
          onClick={() => onMoveMonth(-1)}
        >
          <ChevronLeft className="size-3.5" aria-hidden />
        </button>
        <p className="font-display text-sm leading-none text-[#1e1e1e] uppercase">
          {monthLabel(viewYear, viewMonth, locale)}
        </p>
        <button
          type="button"
          className={NAV_BUTTON}
          aria-label={nextMonthLabel}
          onClick={() => onMoveMonth(1)}
        >
          <ChevronRight className="size-3.5" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {weekdayLabels(locale).map((label) => (
          <div key={label} className="py-1 text-[10px] font-bold text-[#1e1e1e]/45">
            {label}
          </div>
        ))}
        {cells.map((date, index) =>
          date ? (
            <button
              key={date}
              type="button"
              onClick={() => onPick(date)}
              className={`mx-auto flex size-7 items-center justify-center rounded-full text-xs transition-colors ${dayClass(value === date, date === today)}`}
            >
              {Number(date.slice(-2))}
            </button>
          ) : (
            <div key={`blank-${index}`} className="size-7" />
          ),
        )}
      </div>
    </div>
  );
}

/** Admin date control. The popup is ours, so the language follows the site locale. */
export function AdminDateField({
  value,
  onChange,
  disabled = false,
  locale,
  placeholder,
  prevMonthLabel,
  nextMonthLabel,
}: AdminDateFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const today = formatYerevanDate(new Date());
  const anchor = value || today;
  const anchorParts = parseYmd(anchor);
  const [viewYear, setViewYear] = useState(anchorParts.year);
  const [viewMonth, setViewMonth] = useState(anchorParts.monthIndex);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function openCalendar(): void {
    const parts = parseYmd(value || today);
    setViewYear(parts.year);
    setViewMonth(parts.monthIndex);
    setOpen((current) => !current);
  }

  function moveMonth(delta: number): void {
    const next = shiftView(viewYear, viewMonth, delta);
    setViewYear(next.year);
    setViewMonth(next.monthIndex);
  }

  function pickDay(date: string): void {
    onChange(date);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative min-w-[16rem] flex-1">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={openCalendar}
        className={`${ADMIN_INPUT} flex items-center justify-between gap-3 text-left disabled:opacity-50`}
      >
        <span className={value ? 'text-[#1e1e1e]' : 'text-[#1e1e1e]/40'}>
          {value ? formatCalendarDate(value, locale) : placeholder}
        </span>
        <Calendar className="size-4 shrink-0 text-[#ff6b00]" aria-hidden />
      </button>

      {open ? (
        <CalendarPanel
          locale={locale}
          value={value}
          today={today}
          viewYear={viewYear}
          viewMonth={viewMonth}
          placeholder={placeholder}
          prevMonthLabel={prevMonthLabel}
          nextMonthLabel={nextMonthLabel}
          onMoveMonth={moveMonth}
          onPick={pickDay}
        />
      ) : null}
    </div>
  );
}

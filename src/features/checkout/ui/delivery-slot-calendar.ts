/**
 * Fixed month and weekday names. `Intl` disagrees between Node and the
 * browser for `hy`, which hydrates the wrong label.
 */

const MONTH_NAMES = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  hy: [
    'հունվար',
    'փետրվար',
    'մարտ',
    'ապրիլ',
    'մայիս',
    'հունիս',
    'հուլիս',
    'օգոստոս',
    'սեպտեմբեր',
    'հոկտեմբեր',
    'նոյեմբեր',
    'դեկտեմբեր',
  ],
  ru: [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ],
} as const;

const WEEKDAY_LABELS = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  hy: ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
} as const;

type CalendarLocale = keyof typeof MONTH_NAMES;

function calendarLocale(locale: string): CalendarLocale {
  if (locale === 'hy' || locale === 'ru' || locale === 'en') {
    return locale;
  }
  return 'en';
}

export function monthLabel(year: number, monthIndex: number, locale: string): string {
  const months = MONTH_NAMES[calendarLocale(locale)];
  const month = months[monthIndex] ?? months[0];
  return `${month} ${year}`;
}

export function weekdayLabels(locale: string): readonly string[] {
  return WEEKDAY_LABELS[calendarLocale(locale)];
}

export function startOfMonthYmd(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
}

export function parseYmd(ymd: string): { year: number; monthIndex: number; day: number } {
  const [yearText, monthText, dayText] = ymd.split('-');
  return {
    year: Number(yearText),
    monthIndex: Number(monthText) - 1,
    day: Number(dayText),
  };
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** Monday-first cells for one month. `null` is a leading blank. */
export function buildMonthCells(year: number, monthIndex: number): Array<string | null> {
  const totalDays = daysInMonth(year, monthIndex);
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
  return [...Array.from({ length: leadingBlanks }, () => null), ...days];
}

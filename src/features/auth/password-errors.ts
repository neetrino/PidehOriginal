import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

const PASSWORD_ERROR_CODES = [
  'passwordMin',
  'passwordLower',
  'passwordUpper',
  'passwordDigit',
  'passwordSpecial',
  'passwordMismatch',
] as const;

type PasswordErrorCode = (typeof PASSWORD_ERROR_CODES)[number];

function isPasswordErrorCode(value: string): value is PasswordErrorCode {
  return (PASSWORD_ERROR_CODES as readonly string[]).includes(value);
}

/** Maps a password-schema code to the active locale. Unknown text is returned as-is. */
export function translatePasswordError(
  locale: Locale,
  message: string | undefined,
  fallback: string,
): string {
  if (message && isPasswordErrorCode(message)) {
    return getDictionary(locale).auth[message];
  }
  return message ?? fallback;
}

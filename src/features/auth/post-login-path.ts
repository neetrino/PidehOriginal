import type { Locale } from '@/lib/i18n/config';

type UserRole = 'ADMIN' | 'CUSTOMER';

type ResolvePostLoginPathInput = {
  locale: Locale;
  role: UserRole;
  next: FormDataEntryValue | null;
};

/** Home after login when no safe `next` path is provided. */
export function defaultPostLoginPath(locale: Locale, role: UserRole): string {
  return role === 'ADMIN' ? `/${locale}/admin` : `/${locale}/profile`;
}

function isSafeLocalePath(locale: Locale, path: string): boolean {
  return path.startsWith(`/${locale}/`) && !path.startsWith('//');
}

/**
 * Resolves the post-login destination. Admins land on the admin panel unless
 * `next` is a safe, non-profile path (e.g. they were sent from checkout).
 */
export function resolvePostLoginPath({
  locale,
  role,
  next,
}: ResolvePostLoginPathInput): string {
  const fallback = defaultPostLoginPath(locale, role);

  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) {
    return fallback;
  }

  if (!isSafeLocalePath(locale, next)) {
    return fallback;
  }

  const profileHome = `/${locale}/profile`;
  if (role === 'ADMIN' && (next === profileHome || next === `${profileHome}/`)) {
    return fallback;
  }

  return next;
}

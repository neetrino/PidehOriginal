'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { translatePasswordError } from '@/features/auth/password-errors';
import { changePasswordSchema } from '@/features/auth/schemas';
import { requireUser } from '@/lib/auth/policies';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { revokeOtherSessions } from '@/lib/auth/session';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

export type ChangePasswordActionState = {
  error?: string;
  success?: string;
};

/**
 * Changes the signed-in user's password after verifying the current credential.
 * Other sessions are revoked; the current browser session stays active.
 */
export async function changePasswordAction(
  locale: string,
  _previousState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  if (!isLocale(locale)) {
    return { error: 'Invalid locale.' };
  }

  const user = await requireUser(locale as Locale);
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return {
      error: translatePasswordError(
        locale,
        parsed.error.issues[0]?.message,
        getDictionary(locale).auth.passwordInvalid,
      ),
    };
  }

  const copy = getDictionary(locale).profile.passwordForm;

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { error: copy.sameAsCurrent };
  }

  const [row] = await getDb()
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row) {
    return { error: copy.changeFailed };
  }

  const currentMatches = await verifyPassword(parsed.data.currentPassword, row.passwordHash);
  if (!currentMatches) {
    return { error: copy.currentIncorrect };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const now = new Date();

  await getDb()
    .update(users)
    .set({
      passwordHash,
      passwordUpdatedAt: now,
      updatedAt: now,
    })
    .where(eq(users.id, user.id));

  await revokeOtherSessions(user.id);

  revalidatePath(`/${locale}/profile/password`);

  return { success: copy.success };
}

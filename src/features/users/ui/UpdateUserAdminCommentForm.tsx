'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ADMIN_LABEL,
  ADMIN_SECTION_TITLE,
  ADMIN_TEXTAREA,
} from '@/features/admin/ui/admin-form-classes';
import { updateUserAdminCommentAction } from '@/features/users/application/update-user';
import { USER_ADMIN_COMMENT_MAX_LENGTH } from '@/features/users/schemas/admin-users';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type UpdateUserAdminCommentFormProps = {
  locale: string;
  userId: string;
  initialComment: string | null;
  disabled?: boolean;
  copy: Dictionary['admin'];
};

export function UpdateUserAdminCommentForm({
  locale,
  userId,
  initialComment,
  disabled = false,
  copy,
}: UpdateUserAdminCommentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [comment, setComment] = useState(initialComment ?? '');
  const [isPending, startTransition] = useTransition();
  const formCopy = copy.users.commentForm;

  useEffect(() => {
    setComment(initialComment ?? '');
    setError(null);
    setSavedMessage(null);
  }, [userId, initialComment]);

  return (
    <Card className="p-6">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            setError(null);
            setSavedMessage(null);
            const result = await updateUserAdminCommentAction(locale, {
              userId,
              comment,
            });
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            setComment(result.value.comment ?? '');
            setSavedMessage(formCopy.saved);
            router.refresh();
          });
        }}
      >
        <h3 className={ADMIN_SECTION_TITLE}>{formCopy.title}</h3>
        <p className="text-sm text-gray-600">{formCopy.hint}</p>
        <label>
          <span className={ADMIN_LABEL}>{formCopy.label}</span>
          <textarea
            name="comment"
            rows={4}
            maxLength={USER_ADMIN_COMMENT_MAX_LENGTH}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className={ADMIN_TEXTAREA}
            disabled={isPending || disabled}
            placeholder={formCopy.placeholder}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {savedMessage ? <p className="text-sm text-emerald-700">{savedMessage}</p> : null}
        <Button type="submit" size="sm" disabled={isPending || disabled}>
          {isPending ? copy.common.saving : formCopy.save}
        </Button>
      </form>
    </Card>
  );
}

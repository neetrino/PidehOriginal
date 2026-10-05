'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { ADMIN_BADGE } from '@/features/admin/ui/status-badge';
import { updateUserStatusAction } from '@/features/users/application/update-user';
import { isUserStatus, type UserStatus } from '@/features/users/domain/user-lifecycle';

type UserStatusControlProps = {
  locale: string;
  userId: string;
  currentStatus: UserStatus;
  eligibleStatuses: UserStatus[];
  ariaLabel: string;
};

function statusBadgeClass(status: string): string {
  if (status === 'ACTIVE') return 'bg-green-100 text-green-800';
  if (status === 'SUSPENDED' || status === 'ANONYMIZED') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

/** Inline status picker. Choosing a value saves it immediately. */
export function UserStatusControl({
  locale,
  userId,
  currentStatus,
  eligibleStatuses,
  ariaLabel,
}: UserStatusControlProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const options = [currentStatus, ...eligibleStatuses.filter((status) => status !== currentStatus)];

  function changeStatus(next: string): void {
    if (next === currentStatus || !isUserStatus(next)) return;
    startTransition(async () => {
      setError(null);
      const result = await updateUserStatusAction(locale, { userId, status: next });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  if (eligibleStatuses.length === 0) {
    return <span className={`${ADMIN_BADGE} ${statusBadgeClass(currentStatus)}`}>{currentStatus}</span>;
  }

  return (
    <span className="inline-block min-w-[11rem] align-middle">
      <SelectDropdown
        ariaLabel={ariaLabel}
        value={currentStatus}
        options={options.map((status) => ({ label: status, value: status }))}
        disabled={isPending}
        deferChange={false}
        onValueChange={changeStatus}
      />
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </span>
  );
}

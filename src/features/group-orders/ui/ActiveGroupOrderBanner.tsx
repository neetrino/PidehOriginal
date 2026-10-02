'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Users } from 'lucide-react';

import { PAGE_CONTAINER } from '@/components/layout/page-container';
import { AppLink } from '@/components/ui/AppLink';
import { leaveGroupOrderSessionAction } from '@/features/group-orders/actions';
import { GroupOrderConfirmDialog } from '@/features/group-orders/ui/GroupOrderConfirmDialog';
import { GroupOrderSessionWatcher } from '@/features/group-orders/ui/GroupOrderSessionWatcher';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';

function BannerMessage({ template, name }: { template: string; name: string }) {
  const [before, after = ''] = template.split('{name}');

  return (
    <p className="text-sm leading-snug font-semibold text-pideh-ink sm:text-base">
      {before}
      <span className="font-extrabold">{name}</span>
      {after}
    </p>
  );
}

type ActiveGroupOrderBannerProps = {
  locale: Locale;
  labels: Dictionary['groupOrder'];
  organizerDisplayName: string;
  inviteToken: string;
  isOrganizer: boolean;
};

export function ActiveGroupOrderBanner({
  locale,
  labels,
  organizerDisplayName,
  inviteToken,
  isOrganizer,
}: ActiveGroupOrderBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function leaveSession(): void {
    startTransition(async () => {
      await leaveGroupOrderSessionAction();
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <GroupOrderSessionWatcher labels={labels} inviteToken={inviteToken} mode="poll" />
      <div className="group-order-banner">
        <div className={`py-3 ${PAGE_CONTAINER}`}>
          <div className="flex flex-col gap-3 rounded-[26px] border-2 border-pideh-ink/10 bg-white px-3 py-3 shadow-[0_12px_28px_rgba(31,20,8,0.1)] sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pideh-orange text-white">
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold tracking-[0.16em] text-pideh-orange uppercase">
                {labels.activeSessionEyebrow}
              </p>
              <BannerMessage template={labels.activeSessionBanner} name={organizerDisplayName} />
              {isOrganizer ? (
                <p className="mt-1 text-xs leading-relaxed text-pideh-muted">
                  {labels.leaveAsOrganizerHint}
                </p>
              ) : null}
            </div>
            <div className="flex w-full shrink-0 gap-2 sm:w-auto">
              <AppLink
                href={`/${locale}/group-orders/${inviteToken}`}
                prefetchPolicy="intent"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-pideh-orange px-5 text-sm font-bold text-white transition hover:brightness-105 sm:flex-none"
              >
                {labels.openGroupOrder}
              </AppLink>
              <button
                type="button"
                disabled={pending}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border-2 border-pideh-ink/10 bg-pideh-cream px-4 text-sm font-bold text-pideh-ink transition hover:border-pideh-orange hover:text-pideh-orange disabled:opacity-50 sm:flex-none"
                onClick={() => setConfirmOpen(true)}
              >
                {labels.leaveSession}
              </button>
            </div>
          </div>
        </div>
      </div>
      <GroupOrderConfirmDialog
        open={confirmOpen}
        title={isOrganizer ? labels.cancelConfirmTitle : labels.leaveConfirmTitle}
        description={isOrganizer ? labels.cancelConfirmBody : labels.leaveConfirmBody}
        stayLabel={isOrganizer ? labels.cancelStay : labels.leaveStay}
        confirmLabel={isOrganizer ? labels.cancelConfirmAction : labels.leaveConfirmAction}
        closeLabel={labels.close}
        pending={pending}
        onClose={() => {
          if (!pending) setConfirmOpen(false);
        }}
        onConfirm={leaveSession}
      />
    </>
  );
}

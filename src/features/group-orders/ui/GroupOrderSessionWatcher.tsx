'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  checkActiveGroupOrderSessionAction,
  leaveGroupOrderSessionAction,
} from '@/features/group-orders/actions';
import { claimGroupOrderCancelledNotice } from '@/features/group-orders/ui/claim-group-order-cancelled';
import { GroupOrderConfirmDialog } from '@/features/group-orders/ui/GroupOrderConfirmDialog';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

const SESSION_POLL_MS = 8_000;

type GroupOrderSessionWatcherProps = {
  labels: Dictionary['groupOrder'];
  inviteToken?: string;
  /**
   * `poll` — watch an active session for remote cancel.
   * `alert-cancelled` — show the notice and clear after it is dismissed.
   * `clear-ended` — clear a stale terminal session without a notice.
   */
  mode?: 'poll' | 'alert-cancelled' | 'clear-ended';
};

/**
 * Keeps the browser group-order session in sync and explains a remote cancel
 * with the storefront popup instead of a browser alert.
 */
export function GroupOrderSessionWatcher({
  labels,
  inviteToken,
  mode = 'poll',
}: GroupOrderSessionWatcherProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const handledRef = useRef(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  function clearQuietly(): void {
    startTransition(async () => {
      await leaveGroupOrderSessionAction();
      router.refresh();
    });
  }

  function explainCancellation(token: string | undefined): void {
    if (handledRef.current) return;
    handledRef.current = true;
    if (token && claimGroupOrderCancelledNotice(token)) {
      setNoticeOpen(true);
      return;
    }
    clearQuietly();
  }

  useEffect(() => {
    if (mode === 'alert-cancelled') {
      explainCancellation(inviteToken);
      return;
    }
    if (mode === 'clear-ended') {
      if (handledRef.current) return;
      handledRef.current = true;
      clearQuietly();
      return;
    }

    function onRemoteCancel(event: Event): void {
      const token = (event as CustomEvent<{ inviteToken?: string }>).detail?.inviteToken;
      explainCancellation(token ?? inviteToken);
    }

    window.addEventListener('pideh-group-order-cancelled', onRemoteCancel);

    let cancelled = false;
    const timer = window.setInterval(() => {
      void (async () => {
        const next = await checkActiveGroupOrderSessionAction();
        if (cancelled || handledRef.current) return;
        if (next.kind === 'cancelled') {
          explainCancellation(next.inviteToken);
          return;
        }
        if (next.kind === 'ended' || next.kind === 'none') {
          handledRef.current = true;
          clearQuietly();
        }
      })();
    }, SESSION_POLL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener('pideh-group-order-cancelled', onRemoteCancel);
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once watcher
  }, [mode, inviteToken]);

  return (
    <GroupOrderConfirmDialog
      open={noticeOpen}
      title={labels.cancelledNoticeTitle}
      description={labels.cancelledAlert}
      stayLabel={labels.cancelledNoticeAction}
      closeLabel={labels.close}
      onClose={() => {
        setNoticeOpen(false);
        clearQuietly();
      }}
    />
  );
}

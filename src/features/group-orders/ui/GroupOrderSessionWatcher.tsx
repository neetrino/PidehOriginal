"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  checkActiveGroupOrderSessionAction,
  leaveGroupOrderSessionAction,
} from "@/features/group-orders/actions";
import { alertGroupOrderCancelledOnce } from "@/features/group-orders/ui/alert-group-order-cancelled";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const SESSION_POLL_MS = 8_000;

type GroupOrderSessionWatcherProps = {
  labels: Dictionary["groupOrder"];
  inviteToken?: string;
  /**
   * `poll` — watch an active session for remote cancel.
   * `alert-cancelled` — show alert and clear immediately.
   * `clear-ended` — clear stale terminal session without alert.
   */
  mode?: "poll" | "alert-cancelled" | "clear-ended";
};

/**
 * Keeps the browser group-order session in sync: alerts on cancel and clears
 * terminal cookies so the storefront does not keep a dead session.
 */
export function GroupOrderSessionWatcher({
  labels,
  inviteToken,
  mode = "poll",
}: GroupOrderSessionWatcherProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const handledRef = useRef(false);

  function clearSession(showCancelledAlert: boolean, token?: string): void {
    if (handledRef.current) return;
    handledRef.current = true;
    if (showCancelledAlert && token) {
      alertGroupOrderCancelledOnce(token, labels.cancelledAlert);
    } else if (showCancelledAlert) {
      window.alert(labels.cancelledAlert);
    }
    startTransition(async () => {
      await leaveGroupOrderSessionAction();
      router.refresh();
    });
  }

  useEffect(() => {
    if (mode === "alert-cancelled") {
      clearSession(true, inviteToken);
      return;
    }
    if (mode === "clear-ended") {
      clearSession(false);
      return;
    }

    let cancelled = false;
    const timer = window.setInterval(() => {
      void (async () => {
        const next = await checkActiveGroupOrderSessionAction();
        if (cancelled || handledRef.current) return;
        if (next.kind === "cancelled") {
          clearSession(true, inviteToken);
          return;
        }
        if (next.kind === "ended" || next.kind === "none") {
          clearSession(false);
        }
      })();
    }, SESSION_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once watcher
  }, [mode, inviteToken]);

  return null;
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Users } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { leaveGroupOrderSessionAction } from "@/features/group-orders/actions";
import { alertGroupOrderCancelledOnce } from "@/features/group-orders/ui/alert-group-order-cancelled";
import { GroupOrderSessionWatcher } from "@/features/group-orders/ui/GroupOrderSessionWatcher";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type ActiveGroupOrderBannerProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
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

  function leaveSession(): void {
    startTransition(async () => {
      const result = await leaveGroupOrderSessionAction();
      if (result.cancelled) {
        alertGroupOrderCancelledOnce(inviteToken, labels.cancelledAlert);
      }
      router.refresh();
    });
  }

  return (
    <>
      <GroupOrderSessionWatcher
        labels={labels}
        inviteToken={inviteToken}
        mode="poll"
      />
      <div className="border-b-2 border-pideh-ink/10 bg-pideh-yellow/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm text-pideh-ink">
          <p className="inline-flex items-center gap-2 font-semibold">
            <Users className="h-4 w-4 shrink-0 text-pideh-orange" aria-hidden />
            {labels.activeSessionBanner.replace("{name}", organizerDisplayName)}
          </p>
          <div className="flex items-center gap-3">
            <AppLink
              href={`/${locale}/group-orders/${inviteToken}`}
              prefetchPolicy="intent"
              className="font-bold text-pideh-orange underline-offset-2 hover:underline"
            >
              {labels.viewGroupOrder}
            </AppLink>
            <button
              type="button"
              disabled={pending}
              className="font-medium text-pideh-muted transition hover:text-pideh-ink"
              onClick={leaveSession}
              title={
                isOrganizer ? labels.leaveAsOrganizerHint : undefined
              }
            >
              {labels.leaveSession}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

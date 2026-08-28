"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Users } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { leaveGroupOrderSessionAction } from "@/features/group-orders/actions";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type ActiveGroupOrderBannerProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
  organizerDisplayName: string;
  inviteToken: string;
};

export function ActiveGroupOrderBanner({
  locale,
  labels,
  organizerDisplayName,
  inviteToken,
}: ActiveGroupOrderBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
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
            onClick={() => {
              startTransition(async () => {
                await leaveGroupOrderSessionAction();
                router.refresh();
              });
            }}
          >
            {labels.leaveSession}
          </button>
        </div>
      </div>
    </div>
  );
}

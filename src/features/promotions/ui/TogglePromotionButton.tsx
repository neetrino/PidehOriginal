"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { togglePromotionAction } from "@/features/promotions/application/upsert-promotion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type TogglePromotionButtonCopy = {
  toggle: Dictionary["admin"]["discounts"]["toggle"];
  common: Dictionary["admin"]["common"];
};

type TogglePromotionButtonProps = {
  locale: string;
  promotionId: string;
  isActive: boolean;
  copy: TogglePromotionButtonCopy;
};

export function TogglePromotionButton({
  locale,
  promotionId,
  isActive,
  copy,
}: TogglePromotionButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setError(null);
            const result = await togglePromotionAction(locale, {
              promotionId,
              isActive: !isActive,
            });
            if (!result.ok) {
              setError(result.error.message);
              return;
            }
            router.refresh();
          });
        }}
      >
        {isPending
          ? copy.common.updating
          : isActive
            ? copy.toggle.deactivate
            : copy.toggle.activate}
      </Button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

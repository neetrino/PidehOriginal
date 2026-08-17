"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/Button";
import { completeParticipantCardPaymentAction } from "@/features/group-orders/actions";
import type { CheckoutOnlineProvider } from "@/features/checkout/domain/payment-modes";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type GroupOrderPayClientProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
  inviteToken: string;
  displayName: string;
  amountFormatted: string;
  alreadyPaid: boolean;
  amount: number;
};

export function GroupOrderPayClient({
  locale,
  labels,
  inviteToken,
  displayName,
  amountFormatted,
  alreadyPaid,
  amount,
}: GroupOrderPayClientProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<CheckoutOnlineProvider>("arca");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const backHref = `/${locale}/group-orders/${inviteToken}`;

  if (alreadyPaid || amount <= 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <h1 className="text-xl font-bold text-emerald-950">
            {labels.payAlreadyPaidTitle}
          </h1>
          <p className="mt-2 text-sm text-emerald-800">
            {labels.payAlreadyPaidHint}
          </p>
          <AppLink
            href={backHref}
            className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {labels.payBackToGroup}
          </AppLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold text-gray-900">{labels.payTitle}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {labels.payDescription.replace("{name}", displayName)}
        </p>

        <p className="mt-5 text-3xl font-bold tabular-nums text-gray-900">
          {amountFormatted}
        </p>
        <p className="mt-1 text-xs text-gray-500">{labels.payAmountHint}</p>

        <fieldset className="mt-6 space-y-3">
          <legend className="text-sm font-medium text-gray-900">
            {labels.paySelectProvider}
          </legend>
          {(
            [
              {
                id: "arca" as const,
                name: labels.payArca,
                description: labels.payArcaDescription,
                logo: "/assets/payments/arca.svg",
              },
              {
                id: "idram" as const,
                name: labels.payIdram,
                description: labels.payIdramDescription,
                logo: "/assets/payments/idram.svg",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                provider === option.id
                  ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={option.id}
                checked={provider === option.id}
                onChange={() => setProvider(option.id)}
                className="sr-only"
              />
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                <Image
                  src={option.logo}
                  alt=""
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900">
                  {option.name}
                </span>
                <span className="block text-xs text-gray-500">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          className="mt-6 w-full rounded-full"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await completeParticipantCardPaymentAction({
                inviteToken,
                provider,
              });
              if (!result.ok) {
                setError(result.error ?? labels.errorGeneric);
                return;
              }
              router.push(backHref);
              router.refresh();
            });
          }}
        >
          {pending ? labels.payProcessing : labels.payConfirm}
        </Button>

        <AppLink
          href={backHref}
          className="mt-3 block text-center text-sm text-gray-500 underline-offset-2 hover:underline"
        >
          {labels.payBackToGroup}
        </AppLink>
      </div>
    </div>
  );
}

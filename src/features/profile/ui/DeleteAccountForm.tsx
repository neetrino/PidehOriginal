"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_PANEL,
} from "@/features/profile/ui/profile-ui-classes";
import { ProfilePageHeading } from "@/features/profile/ui/ProfilePageHeading";
import {
  deleteAccountAction,
  type DeleteAccountActionState,
} from "@/features/auth/delete-account-action";

type DeleteAccountFormProps = {
  locale: string;
  labels: {
    eyebrow: string;
    title: string;
    description: string;
    pointOrders: string;
    pointLogin: string;
    pointData: string;
    currentPassword: string;
    currentPasswordPlaceholder: string;
    acknowledge: string;
    submit: string;
    deleting: string;
  };
};

const initialState: DeleteAccountActionState = {};

export function DeleteAccountForm({ locale, labels }: DeleteAccountFormProps) {
  const action = deleteAccountAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="profile-sheet-keep-frame space-y-6">
      <ProfilePageHeading
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
      />
      <div className={`${PROFILE_PANEL} border-red-200`}>
      <ul className="mb-8 max-w-2xl list-disc space-y-2 pl-5 text-sm text-[#1e1e1e]/70 sm:mb-10">
        <li>{labels.pointOrders}</li>
        <li>{labels.pointLogin}</li>
        <li>{labels.pointData}</li>
      </ul>

      <form
        action={formAction}
        className="mx-auto max-w-xl space-y-6 lg:mx-0 lg:max-w-2xl"
      >
        <label className={PROFILE_LABEL}>
          {labels.currentPassword}
          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={labels.currentPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="current-password"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            name="acknowledged"
            type="checkbox"
            value="on"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span className="text-sm leading-snug text-[#1e1e1e]">
            {labels.acknowledge}
          </span>
        </label>

        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="pt-1 sm:pt-2">
          <Button
            type="submit"
            variant="primary"
            className="h-11 w-full !bg-red-700 hover:!bg-red-800 focus:!ring-red-600 sm:w-auto"
            disabled={isPending || !acknowledged}
          >
            {isPending ? labels.deleting : labels.submit}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

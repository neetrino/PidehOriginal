"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_PANEL,
  PROFILE_PRIMARY_BTN,
} from "@/features/profile/ui/profile-ui-classes";
import { ProfilePageHeading } from "@/features/profile/ui/ProfilePageHeading";
import {
  changePasswordAction,
  type ChangePasswordActionState,
} from "@/features/auth/change-password-action";

type ChangePasswordFormProps = {
  locale: string;
  labels: {
    eyebrow: string;
    title: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    currentPasswordPlaceholder: string;
    newPasswordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    change: string;
    changing: string;
  };
};

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialState: ChangePasswordActionState = {};

export function ChangePasswordForm({ locale, labels }: ChangePasswordFormProps) {
  const action = changePasswordAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [values, setValues] = useState(emptyForm);

  useEffect(() => {
    if (state.success) {
      setValues(emptyForm);
    }
  }, [state.success]);

  return (
    <div className="profile-sheet-keep-frame space-y-6">
      <ProfilePageHeading eyebrow={labels.eyebrow} title={labels.title} />
      <div className={PROFILE_PANEL}>
      <form
        action={formAction}
        className="mx-auto max-w-xl space-y-6 lg:mx-0 lg:max-w-2xl"
      >
        <label className={PROFILE_LABEL}>
          {labels.currentPassword}
          <input
            name="currentPassword"
            type="password"
            required
            value={values.currentPassword}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                currentPassword: event.target.value,
              }))
            }
            placeholder={labels.currentPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="current-password"
          />
        </label>

        <label className={PROFILE_LABEL}>
          {labels.newPassword}
          <input
            name="newPassword"
            type="password"
            required
            value={values.newPassword}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                newPassword: event.target.value,
              }))
            }
            placeholder={labels.newPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="new-password"
          />
        </label>

        <label className={PROFILE_LABEL}>
          {labels.confirmPassword}
          <input
            name="confirmPassword"
            type="password"
            required
            value={values.confirmPassword}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            placeholder={labels.confirmPasswordPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="new-password"
          />
        </label>

        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-700" role="status">
            {state.success}
          </p>
        ) : null}

        <div className="pt-2 sm:pt-4">
          <Button
            type="submit"
            variant="primary"
            className={`h-11 w-full sm:w-auto ${PROFILE_PRIMARY_BTN}`}
            disabled={isPending}
          >
            {isPending ? labels.changing : labels.change}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

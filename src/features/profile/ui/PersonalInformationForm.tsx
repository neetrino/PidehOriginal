"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_OUTLINE_BTN,
  PROFILE_PANEL,
  PROFILE_PRIMARY_BTN,
} from "@/features/profile/ui/profile-ui-classes";
import { ProfilePageHeading } from "@/features/profile/ui/ProfilePageHeading";
import {
  updateProfileAction,
  type UpdateProfileActionState,
} from "@/features/auth/update-profile-action";

type PersonalInformationFormProps = {
  locale: string;
  firstName: string;
  lastName: string;
  email: string;
  labels: {
    eyebrow: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    cancel: string;
    save: string;
    saving: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
  };
};

const initialState: UpdateProfileActionState = {};

export function PersonalInformationForm({
  locale,
  firstName,
  lastName,
  email,
  labels,
}: PersonalInformationFormProps) {
  const action = updateProfileAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [values, setValues] = useState({
    firstName,
    lastName,
    email,
  });

  useEffect(() => {
    setValues({ firstName, lastName, email });
  }, [firstName, lastName, email]);

  function resetToSaved(): void {
    setValues({ firstName, lastName, email });
  }

  return (
    <div className="profile-sheet-keep-frame space-y-6">
      <ProfilePageHeading eyebrow={labels.eyebrow} title={labels.title} />
      <div className={PROFILE_PANEL}>
      <form
        action={formAction}
        className="mx-auto max-w-xl space-y-6 lg:mx-0 lg:max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <label className={PROFILE_LABEL}>
            {labels.firstName}
            <input
              name="firstName"
              required
              value={values.firstName}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  firstName: event.target.value,
                }))
              }
              placeholder={labels.firstNamePlaceholder}
              className={PROFILE_FIELD}
              autoComplete="given-name"
            />
          </label>
          <label className={PROFILE_LABEL}>
            {labels.lastName}
            <input
              name="lastName"
              required
              value={values.lastName}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  lastName: event.target.value,
                }))
              }
              placeholder={labels.lastNamePlaceholder}
              className={PROFILE_FIELD}
              autoComplete="family-name"
            />
          </label>
        </div>

        <label className={PROFILE_LABEL}>
          {labels.email}
          <input
            name="email"
            type="email"
            required
            value={values.email}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder={labels.emailPlaceholder}
            className={PROFILE_FIELD}
            autoComplete="email"
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

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4 sm:pt-4">
          <Button
            type="button"
            variant="outline"
            className={`h-11 w-full sm:w-auto ${PROFILE_OUTLINE_BTN}`}
            onClick={resetToSaved}
            disabled={isPending}
          >
            {labels.cancel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className={`h-11 w-full sm:w-auto ${PROFILE_PRIMARY_BTN}`}
            disabled={isPending}
          >
            {isPending ? labels.saving : labels.save}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

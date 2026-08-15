"use client";

import { useActionState } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { type AuthActionState } from "@/features/auth/login-action";
import { registerAction } from "@/features/auth/register-action";
import {
  AUTH_INPUT_CLASS,
  AUTH_LABEL_CLASS,
} from "@/features/auth/ui/auth-field-styles";
import { PasswordField } from "@/features/auth/ui/PasswordField";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const initialState: AuthActionState = {};

type RegisterFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export function RegisterForm({ locale, dictionary }: RegisterFormProps) {
  const action = registerAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className={AUTH_LABEL_CLASS}>
          {dictionary.firstName}
          <input
            required
            name="firstName"
            autoComplete="given-name"
            className={AUTH_INPUT_CLASS}
          />
        </label>
        <label className={AUTH_LABEL_CLASS}>
          {dictionary.lastName}
          <input
            required
            name="lastName"
            autoComplete="family-name"
            className={AUTH_INPUT_CLASS}
          />
        </label>
      </div>

      <label className={AUTH_LABEL_CLASS}>
        {dictionary.email}
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          className={AUTH_INPUT_CLASS}
        />
      </label>

      <label className={AUTH_LABEL_CLASS}>
        {dictionary.phone}
        <input
          required
          name="phone"
          type="tel"
          autoComplete="tel"
          className={AUTH_INPUT_CLASS}
        />
      </label>

      <PasswordField
        name="password"
        label={dictionary.password}
        showPasswordLabel={dictionary.showPassword}
        hidePasswordLabel={dictionary.hidePassword}
        autoComplete="new-password"
        variant="night"
      />

      <PasswordField
        name="confirmPassword"
        label={dictionary.confirmPassword}
        showPasswordLabel={dictionary.showPassword}
        hidePasswordLabel={dictionary.hidePassword}
        autoComplete="new-password"
        variant="night"
      />

      {state.error ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <button
        disabled={isPending}
        className="h-12 rounded-full bg-[#ff6b00] px-4 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {isPending
          ? dictionary.submittingRegister
          : dictionary.submitRegister}
      </button>

      <p className="text-center text-sm text-white/65">
        {dictionary.hasAccount}{" "}
        <AppLink
          href={`/${locale}/login`}
          prefetchPolicy="intent"
          className="font-bold text-[#ffd54a] underline-offset-2 hover:underline"
        >
          {dictionary.signInLink}
        </AppLink>
      </p>
    </form>
  );
}

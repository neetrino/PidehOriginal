"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { loginAction, type AuthActionState } from "@/features/auth/login-action";
import {
  AUTH_INPUT_CLASS,
  AUTH_LABEL_CLASS,
} from "@/features/auth/ui/auth-field-styles";
import { PasswordField } from "@/features/auth/ui/PasswordField";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const initialState: AuthActionState = {};

type LoginFormProps = {
  locale: Locale;
  dictionary: Dictionary["auth"];
};

export function LoginForm({ locale, dictionary }: LoginFormProps) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const resetSucceeded = searchParams.get("reset") === "1";
  const action = loginAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      {resetSucceeded ? (
        <p
          role="status"
          className="rounded-2xl border border-[#ffd54a]/40 bg-[#ffd54a]/15 p-3 text-sm text-[#ffd54a]"
        >
          {dictionary.resetPasswordSuccess}
        </p>
      ) : null}

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
      <PasswordField
        name="password"
        label={dictionary.password}
        showPasswordLabel={dictionary.showPassword}
        hidePasswordLabel={dictionary.hidePassword}
        autoComplete="current-password"
        variant="night"
      />
      <div className="flex justify-end">
        <AppLink
          href={`/${locale}/forgot-password`}
          prefetchPolicy="intent"
          className="text-sm font-medium text-[#ffd54a] underline-offset-2 hover:text-white hover:underline"
        >
          {dictionary.forgotPassword}
        </AppLink>
      </div>
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
        {isPending ? dictionary.submittingLogin : dictionary.submitLogin}
      </button>
      <p className="text-center text-sm text-white/65">
        {dictionary.noAccount}{" "}
        <AppLink
          href={`/${locale}/register`}
          prefetchPolicy="intent"
          className="font-bold text-[#ffd54a] underline-offset-2 hover:underline"
        >
          {dictionary.submitRegister}
        </AppLink>
      </p>
    </form>
  );
}

"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { AUTH_INPUT_CLASS, AUTH_LABEL_CLASS } from "@/features/auth/ui/auth-field-styles";

const DEFAULT_FIELD_CLASS =
  "h-10 w-full rounded-lg border border-gray-200 px-3 pr-10 text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200";

type PasswordFieldProps = {
  name: string;
  label: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  autoComplete: string;
  variant?: "night";
};

export function PasswordField({
  name,
  label,
  showPasswordLabel,
  hidePasswordLabel,
  autoComplete,
  variant,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const labelClass = variant
    ? AUTH_LABEL_CLASS
    : "flex flex-col gap-1.5 text-sm font-medium text-gray-700";
  const inputClass = variant ? `${AUTH_INPUT_CLASS} pr-10` : DEFAULT_FIELD_CLASS;
  const toggleClass =
    variant === "night"
      ? "absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#ffd54a] transition hover:text-white"
      : "absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 transition hover:text-gray-800";

  return (
    <label className={labelClass}>
      {label}
      <span className="relative block">
        <input
          required
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={inputClass}
        />
        <button
          type="button"
          className={toggleClass}
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </span>
    </label>
  );
}

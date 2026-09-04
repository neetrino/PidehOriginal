"use client";

import { LayoutDashboard, LogOut, User } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { IconDropdown } from "@/components/ui/IconDropdown";
import { logoutAction } from "@/features/auth/logout-action";
import type { Locale } from "@/lib/i18n/config";
import type { SessionUser } from "@/lib/auth/session";

type AccountControlsProps = {
  locale: Locale;
  loginLabel: string;
  logoutLabel: string;
  profileLabel: string;
  adminLabel: string;
  user: SessionUser | null;
};

const menuItemClassName =
  "flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold whitespace-nowrap text-[#1e1e1e] transition-colors hover:bg-[#ff6b00]/12 hover:text-[#ff6b00]";

const logoutItemClassName =
  "flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left text-sm font-semibold whitespace-nowrap text-[#1e1e1e] transition-colors hover:bg-[#ff6b00]/12 hover:text-[#ff6b00]";

function iconButtonClassName(active = false): string {
  const base =
    "inline-flex h-11 w-11 items-center justify-center rounded-full transition duration-150";
  return active
    ? `${base} bg-[#fff8e7] text-[#1e1e1e] ring-2 ring-[#1e1e1e]`
    : `${base} text-[#1e1e1e] hover:bg-[#fff8e7] hover:text-[#ff6b00]`;
}

export function AccountControls({
  locale,
  loginLabel,
  logoutLabel,
  profileLabel,
  adminLabel,
  user,
}: AccountControlsProps) {
  const logoutWithLocale = logoutAction.bind(null, locale);

  if (!user) {
    return (
      <AppLink
        href={`/${locale}/login`}
        prefetchPolicy="intent"
        className={iconButtonClassName()}
        aria-label={loginLabel}
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </AppLink>
    );
  }

  return (
    <IconDropdown
      label={profileLabel}
      tone="brand"
      triggerClassName={iconButtonClassName()}
      trigger={(open) => (
        <User
          className={`h-5 w-5 transition-colors ${open ? "text-[#ff6b00]" : ""}`}
          aria-hidden="true"
        />
      )}
      openOnHover
    >
      {user.role === "ADMIN" ? (
        <AppLink
          href={`/${locale}/admin`}
          prefetchPolicy="intent"
          role="menuitem"
          className={menuItemClassName}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
          {adminLabel}
        </AppLink>
      ) : null}
      <AppLink
        href={`/${locale}/profile`}
        prefetchPolicy="intent"
        role="menuitem"
        className={menuItemClassName}
      >
        <User className="h-4 w-4 shrink-0" aria-hidden="true" />
        {profileLabel}
      </AppLink>
      <div className="my-1.5 h-px bg-[#1e1e1e]/12" aria-hidden="true" />
      <form action={logoutWithLocale} className="w-full">
        <button type="submit" role="menuitem" className={logoutItemClassName}>
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          {logoutLabel}
        </button>
      </form>
    </IconDropdown>
  );
}

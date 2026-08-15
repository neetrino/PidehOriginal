"use client";

import Link from "next/link";

import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminSidebarBrandProps = {
  locale: string;
  shell: Dictionary["admin"]["shell"];
};

export function AdminSidebarBrand({ locale, shell }: AdminSidebarBrandProps) {
  const { collapsed, toggleCollapsed } = useAdminSidebarCollapse();

  return (
    <div
      className={`relative z-10 flex shrink-0 border-b border-white/15 bg-black/20 pb-3 pt-2 backdrop-blur-md ${
        collapsed
          ? "flex-col items-center gap-2 px-1"
          : "items-center gap-1 px-2"
      }`}
    >
      {collapsed ? (
        <Link
          href={`/${locale}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6b00] text-sm font-bold text-white hover:bg-[#e85f00]"
          title={shell.brandHomeTitle}
        >
          {shell.brandInitial}
        </Link>
      ) : (
        <Link
          href={`/${locale}`}
          className="min-w-0 flex-1 rounded-full px-2 py-2 text-sm font-extrabold tracking-wide text-white uppercase hover:bg-white/10"
        >
          {shell.brandName}
        </Link>
      )}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
        aria-expanded={!collapsed}
        aria-label={collapsed ? shell.expandSidebar : shell.collapseSidebar}
        title={collapsed ? shell.expandSidebar : shell.collapseSidebar}
      >
        {collapsed ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

import { ProfileSidebarNav } from "@/features/profile/ui/ProfileSidebarNav";
import { logoutAction } from "@/features/auth/logout-action";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { SessionUser } from "@/lib/auth/session";

type ProfileSidebarProps = {
  locale: Locale;
  user: SessionUser;
  dictionary: Dictionary["profile"];
};

export function ProfileSidebar({
  locale,
  user,
  dictionary,
}: ProfileSidebarProps) {
  const logoutWithLocale = logoutAction.bind(null, locale);

  return (
    <aside
      className="flex w-full flex-col overflow-hidden rounded-[28px] border border-[#ff6b00]/15 bg-[#fff8e7] shadow-[0_14px_32px_rgba(30,30,30,0.08)] lg:h-full lg:min-h-0"
      aria-label={dictionary.title}
    >
      <div className="shrink-0 border-b border-[#ff6b00]/12 bg-[#ffd54a]/35 p-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-[4.5rem] items-center justify-center rounded-full bg-[#ff6b00] text-xl font-bold text-white shadow-[0_0_0_4px_#fff8e7,0_8px_20px_rgba(255,107,0,0.35)]">
            {user.firstName.slice(0, 1).toUpperCase()}
            {user.lastName.slice(0, 1).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <p className="font-display text-2xl leading-[0.9] text-[#1e1e1e] uppercase">
              {user.firstName}
            </p>
            <p className="text-xs font-bold tracking-wide text-[#1e1e1e]/60">
              {user.lastName}
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-white/80 px-3.5 py-2.5 text-left text-xs font-medium break-words text-[#1e1e1e]/75 sm:text-sm">
          {user.email}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ProfileSidebarNav
          locale={locale}
          dictionary={dictionary}
          logoutAction={logoutWithLocale}
        />
      </div>
    </aside>
  );
}

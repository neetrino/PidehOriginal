import Image from 'next/image';

import { isLocale } from '@/lib/i18n/config';

const AUTH_ENTRY_SECTIONS = new Set([
  'login',
  'register',
  'forgot-password',
  'reset-password',
]);

/** Login and the pages it links to stay reachable before sign-in. */
export function isComingSoonBypassPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const section = isLocale(segments[0] ?? '') ? segments[1] : segments[0];
  return section != null && AUTH_ENTRY_SECTIONS.has(section);
}

/** Full-page launch screen. The artwork covers the viewport edge to edge. */
export function ComingSoonScreen() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#ff6b00]">
      <style>{'#tidio-chat,#tidio-chat-iframe{display:none !important}'}</style>
      <Image
        src="/brand/pideh/coming-soon-mobile.webp"
        alt="Coming soon"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-center lg:hidden"
      />
      <Image
        src="/brand/pideh/coming-soon-desktop-v4.webp"
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="hidden object-cover object-center lg:block"
      />
    </div>
  );
}

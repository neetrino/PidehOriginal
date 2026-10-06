import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { AppLink } from '@/components/ui/AppLink';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';

type LegalHubPageProps = {
  params: Promise<{ locale: string }>;
};

const PAYMENT_BADGES = [
  { label: 'Mastercard', src: '/assets/payments/mastercard.png' },
  { label: 'ArCa', src: '/assets/payments/arca.png' },
  { label: 'Idram', src: '/assets/payments/idram.png' },
  { label: 'Visa', src: '/assets/payments/visa.png' },
] as const;

/** Policy index linked from the mobile menu. */
export default async function LegalHubPage({ params }: LegalHubPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const footer = dictionary.footer;
  const links = [
    { href: `/${locale}/legal/delivery`, label: footer.deliveryReturns },
    { href: `/${locale}/legal/terms`, label: footer.terms },
    { href: `/${locale}/legal/privacy`, label: footer.privacyPolicy },
  ];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <h1 className="font-display text-[clamp(2.2rem,8vw,3.4rem)] leading-[0.95] text-[#ff6b00] uppercase">
        {dictionary.nav.policies}
      </h1>

      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <AppLink
              href={link.href}
              prefetchPolicy="intent"
              className="flex items-center justify-between gap-4 rounded-[22px] border border-[#ff6b00]/35 bg-white px-5 py-4 text-base font-semibold text-[#1e1e1e] transition hover:bg-[#fff8e7]"
            >
              <span>{link.label}</span>
              <ChevronRight className="size-5 shrink-0 text-[#ff6b00]" aria-hidden="true" />
            </AppLink>
          </li>
        ))}
      </ul>

      <ul className="grid grid-cols-2 gap-3">
        {PAYMENT_BADGES.map((badge) => (
          <li
            key={badge.label}
            className="flex h-20 items-center justify-center rounded-[18px] bg-white px-4 shadow-[0_8px_18px_rgba(30,30,30,0.06)]"
          >
            <Image
              src={badge.src}
              alt={badge.label}
              width={140}
              height={48}
              className="h-10 w-auto max-w-full object-contain"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

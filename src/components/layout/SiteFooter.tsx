import Image from "next/image";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type SiteFooterProps = {
  dictionary: Dictionary;
  locale: Locale;
};

type SocialItem = {
  href: string;
  label: string;
  src: string;
  inner?: boolean;
};

export function SiteFooter({ dictionary, locale }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const footer = dictionary.footer;
  const social = dictionary.contact.social;

  const socials: readonly SocialItem[] = [
    { href: social.instagram, label: "Instagram", src: PIDEH_ASSETS.socialInstagram },
    { href: social.facebook, label: "Facebook", src: PIDEH_ASSETS.socialFacebook },
    { href: social.linkedin, label: "Telegram", src: PIDEH_ASSETS.socialTelegram },
    { href: social.instagram, label: "WhatsApp", src: PIDEH_ASSETS.socialWhatsapp },
    { href: social.instagram, label: "Viber", src: PIDEH_ASSETS.socialViber, inner: true },
  ];

  return (
    <footer className="storefront-footer relative mt-auto hidden overflow-hidden bg-[#ff6b00] md:block">
      {/* Figma Rectangle 7 (1:202) — 1442×472; top/side overflow kept, bottom clipped so it does not add page gap */}
      <div className="relative w-full" style={{ aspectRatio: "1442 / 472" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ inset: "-8.05% -2.36% 0 -2.36%" }}
        >
          {/* Decorative SVG — Next/Image fill would flatten the Figma overflow box */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PIDEH_ASSETS.waveFooter}
            alt=""
            width={1510}
            height={540}
            className="block size-full max-w-none"
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-8 pb-5 pt-[7.5%]">
          <div className="grid grid-cols-1 items-start gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Image
                src={PIDEH_ASSETS.footerLogo}
                alt={dictionary.brand}
                width={99}
                height={77}
                className="mt-[21px] h-[77px] w-[99px]"
              />
              <p className="mt-6 max-w-[436px] text-base leading-[17px] text-[#1e1e1e]">
                {footer.description}
              </p>
              <div className="mt-[19px] flex items-center gap-4">
                {socials.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      item.inner
                        ? "relative flex size-10 items-center justify-center rounded-full bg-[#ff6b00] transition hover:brightness-105"
                        : "size-10 shrink-0 transition hover:brightness-105"
                    }
                    aria-label={item.label}
                  >
                    <Image
                      src={item.src}
                      alt=""
                      width={item.inner ? 20 : 40}
                      height={item.inner ? 22 : 40}
                      className={item.inner ? "h-[22px] w-5" : "size-10"}
                    />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:pl-10">
              <h4 className="font-display mb-5 text-[18px] leading-5 text-[#ff6b00] uppercase">
                {footer.navigation}
              </h4>
              <ul className="space-y-4 text-base leading-[17px] text-[#1e1e1e]">
                <li>
                  <AppLink
                    href={`/${locale}/products`}
                    prefetchPolicy="intent"
                    className="transition hover:text-[#ff6b00]"
                  >
                    {dictionary.nav.menu}
                  </AppLink>
                </li>
                <li>
                  <AppLink
                    href={`/${locale}/about`}
                    prefetchPolicy="intent"
                    className="transition hover:text-[#ff6b00]"
                  >
                    {dictionary.nav.about}
                  </AppLink>
                </li>
                <li>
                  <AppLink
                    href={`/${locale}/contact`}
                    prefetchPolicy="intent"
                    className="transition hover:text-[#ff6b00]"
                  >
                    {dictionary.nav.contact}
                  </AppLink>
                </li>
              </ul>
            </div>

            <div className="lg:pl-10">
              <h4 className="font-display mb-5 text-[18px] leading-5 text-[#ff6b00] uppercase">
                {footer.contactInfo}
              </h4>
              <ul className="space-y-3 text-base leading-[17px] text-[#1e1e1e]">
                <li className="flex items-center gap-2">
                  <Phone className="h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                  <a
                    href={`tel:${dictionary.contact.storePhone}`}
                    className="transition hover:text-[#ff6b00]"
                  >
                    {dictionary.contact.storePhone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                  <a
                    href={`mailto:${dictionary.contact.storeEmail}`}
                    className="transition hover:text-[#ff6b00]"
                  >
                    {dictionary.contact.storeEmail}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                  <p>{dictionary.contact.storeAddress}</p>
                </li>
                {dictionary.contact.storeAddressSecondary ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                    <p>{dictionary.contact.storeAddressSecondary}</p>
                  </li>
                ) : null}
                <li className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                  <div className="text-base leading-[17px] text-[#1e1e1e]">
                    <p>{dictionary.contact.hoursWeekdays}</p>
                    <p className="text-sm leading-4">
                      {dictionary.contact.hoursDelivery}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="lg:pl-10">
              <h4 className="font-display mb-6 text-[18px] leading-5 text-[#ff6b00] uppercase">
                {footer.support}
              </h4>
              <ul className="space-y-4 text-sm leading-5 text-[#1e1e1e]">
                <li>
                  <AppLink
                    href={`/${locale}/legal/terms`}
                    prefetchPolicy="intent"
                    className="transition hover:text-[#ff6b00]"
                  >
                    {footer.deliveryReturns}
                  </AppLink>
                </li>
                <li>
                  <AppLink
                    href={`/${locale}/legal/terms`}
                    prefetchPolicy="intent"
                    className="transition hover:text-[#ff6b00]"
                  >
                    {footer.terms}
                  </AppLink>
                </li>
                <li>
                  <AppLink
                    href={`/${locale}/legal/privacy`}
                    prefetchPolicy="intent"
                    className="transition hover:text-[#ff6b00]"
                  >
                    {footer.privacyPolicy}
                  </AppLink>
                </li>
                <li>
                  <AppLink
                    href={`/${locale}/contact`}
                    prefetchPolicy="intent"
                    className="transition hover:text-[#ff6b00]"
                  >
                    {footer.faq}
                  </AppLink>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-2 text-center">
            <p className="text-sm leading-4 tracking-[0.35px] text-[#1e1e1e]">
              {footer.copyright
                .replace("{year}", String(year))
                .split("Neetrino IT Company")
                .map((part, index, parts) =>
                  index < parts.length - 1 ? (
                    <span key={`copy-${index}`}>
                      {part}
                      <span className="text-[#ff6900]">Neetrino IT Company</span>
                    </span>
                  ) : (
                    <span key={`copy-end-${index}`}>{part}</span>
                  ),
                )}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

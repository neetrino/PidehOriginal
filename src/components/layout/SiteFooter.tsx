import Image from "next/image";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { RevealOnView } from "@/components/motion/RevealOnView";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { footerColumn } from "@/components/motion/presets";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import { SwimDripWave } from "@/features/home/ui/SwimDripWave";
import { FOOTER_DRIP } from "@/features/home/ui/wave-paths";
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
    <div className="mt-auto hidden md:block">
    <footer className="storefront-footer relative -mt-10 overflow-hidden bg-[#ff6b00] pt-24">
      <div className="relative w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div
            className="absolute inset-0 left-1/2 max-w-none w-[104.72%] -translate-x-1/2 [filter:drop-shadow(0_-4px_17px_rgba(199,89,15,0.21))]"
          >
            <SwimDripWave spec={FOOTER_DRIP} />
          </div>
        </div>

        <div className="relative z-[2] mx-auto flex max-w-[1280px] flex-col px-8 pb-16 pt-48">
          <StaggerGroup
            className="grid grid-cols-1 items-start gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4"
            stagger={0.12}
          >
            <StaggerItem variants={footerColumn}>
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
            </StaggerItem>

            <StaggerItem className="lg:pl-10" variants={footerColumn}>
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
            </StaggerItem>

            <StaggerItem className="lg:pl-10" variants={footerColumn}>
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
            </StaggerItem>

            <StaggerItem className="lg:pl-10" variants={footerColumn}>
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
            </StaggerItem>
          </StaggerGroup>

          <RevealOnView className="mt-16 pt-2 text-center" variants={footerColumn} delay={0.2}>
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
          </RevealOnView>
        </div>
      </div>
    </footer>
    </div>
  );
}

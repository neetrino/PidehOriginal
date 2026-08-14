import Image from "next/image";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
} from "@/components/layout/SocialIcons";
import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type SiteFooterProps = {
  dictionary: Dictionary;
  locale: Locale;
};

export function SiteFooter({ dictionary, locale }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const footer = dictionary.footer;

  return (
    <footer className="storefront-footer relative mt-auto hidden overflow-hidden bg-[#ffd54a] md:block">
      {/* Figma Rectangle 7 (1:202) — yellow footer band (#FFD54A) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[80px] -translate-y-1/2 md:h-[120px]"
      >
        <Image
          src={PIDEH_ASSETS.waveFooter}
          alt=""
          fill
          className="object-cover object-top"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Image
              src={PIDEH_ASSETS.footerLogo}
              alt={dictionary.brand}
              width={99}
              height={77}
              className="h-[77px] w-auto"
            />
            <p className="mt-6 max-w-[436px] text-sm leading-[1.35] text-[#364153]">
              {footer.description}
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href={dictionary.contact.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-[#ff6b00] text-white transition hover:brightness-105"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href={dictionary.contact.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-[#ff6b00] text-white transition hover:brightness-105"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href={dictionary.contact.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-[#ff6b00] text-white transition hover:brightness-105"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[#1e1e1e]">
              {footer.navigation}
            </h4>
            <ul className="space-y-4">
              <li>
                <AppLink
                  href={`/${locale}/products`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {dictionary.nav.menu}
                </AppLink>
              </li>
              <li>
                <AppLink
                  href={`/${locale}/about`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {dictionary.nav.about}
                </AppLink>
              </li>
              <li>
                <AppLink
                  href={`/${locale}/contact`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {dictionary.nav.contact}
                </AppLink>
              </li>
              <li>
                <AppLink
                  href={`/${locale}/blog`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {dictionary.nav.blog}
                </AppLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[#1e1e1e]">
              {footer.contactInfo}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                <a
                  href={`tel:${dictionary.contact.storePhone}`}
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {dictionary.contact.storePhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                <a
                  href={`mailto:${dictionary.contact.storeEmail}`}
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {dictionary.contact.storeEmail}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                <div className="space-y-2 text-sm text-[#364153]">
                  <p>{dictionary.contact.storeAddress}</p>
                  {dictionary.contact.storeAddressSecondary ? (
                    <p>{dictionary.contact.storeAddressSecondary}</p>
                  ) : null}
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-[21px] w-[21px] shrink-0 text-[#ff6b00]" />
                <div className="text-sm text-[#364153]">
                  <p>{dictionary.contact.hoursWeekdays}</p>
                  <p>{dictionary.contact.hoursDelivery}</p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold text-[#1e1e1e]">
              {footer.support}
            </h4>
            <ul className="space-y-4">
              <li>
                <AppLink
                  href={`/${locale}/legal/terms`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {footer.deliveryReturns}
                </AppLink>
              </li>
              <li>
                <AppLink
                  href={`/${locale}/legal/terms`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {footer.terms}
                </AppLink>
              </li>
              <li>
                <AppLink
                  href={`/${locale}/legal/privacy`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {footer.privacyPolicy}
                </AppLink>
              </li>
              <li>
                <AppLink
                  href={`/${locale}/contact`}
                  prefetchPolicy="intent"
                  className="text-sm text-[#364153] transition hover:text-[#ff6b00]"
                >
                  {footer.faq}
                </AppLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#e8dcc0] pt-8 text-center">
          <p className="text-sm text-[#6b6b6b]">
            {footer.copyright.replace("{year}", String(year))}
          </p>
        </div>
      </div>
    </footer>
  );
}

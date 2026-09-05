"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const MENU_EXIT_MS = 260;
const MENU_GAP_PX = 8;
const MENU_INSET_PX = 12;

type NavItem = {
  href: string;
  label: string;
};

type MobileNavDrawerProps = {
  locale: Locale;
  dictionary: Dictionary;
  navItems: readonly NavItem[];
  /** Optional classes for the open/close trigger button. */
  triggerClassName?: string;
  /** When set, replaces the default Menu/X glyphs inside the trigger. */
  triggerContent?: ReactNode;
};

function isNavItemActive(pathname: string, href: string, locale: Locale): boolean {
  if (href === `/${locale}` || href === `/${locale}/`) {
    return pathname === `/${locale}` || pathname === `/${locale}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Pideh mobile nav: floating white panel under the header/trigger
 * (not a side sheet), with warm scrim + scale/fade motion.
 */
export function MobileNavDrawer({
  locale,
  dictionary,
  navItems,
  triggerClassName,
  triggerContent,
}: MobileNavDrawerProps) {
  const menuId = useId();
  const pathname = usePathname() ?? "";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const exitTimerRef = useRef<number | null>(null);
  const renderedRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [panelTopPx, setPanelTopPx] = useState(72);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const measureHeader = useCallback(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (header) {
      setPanelTopPx(header.getBoundingClientRect().bottom);
      return;
    }
    const trigger = triggerRef.current;
    if (trigger) {
      setPanelTopPx(trigger.getBoundingClientRect().bottom);
    }
  }, []);

  const openMenu = useCallback(() => {
    clearExitTimer();
    measureHeader();
    renderedRef.current = true;
    setRendered(true);
    setExpanded(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpanded(true);
      });
    });
  }, [clearExitTimer, measureHeader]);

  const closeMenu = useCallback(() => {
    clearExitTimer();
    setExpanded(false);
    exitTimerRef.current = window.setTimeout(() => {
      renderedRef.current = false;
      setRendered(false);
      exitTimerRef.current = null;
    }, MENU_EXIT_MS);
  }, [clearExitTimer]);

  const toggleMenu = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => clearExitTimer();
  }, [clearExitTimer]);

  useEffect(() => {
    if (open) {
      openMenu();
      return;
    }
    if (!renderedRef.current) return;
    closeMenu();
  }, [open, openMenu, closeMenu]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    function closeOnDesktop(): void {
      if (media.matches) setOpen(false);
    }
    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!rendered) return;
    measureHeader();
    window.addEventListener("resize", measureHeader);
    return () => window.removeEventListener("resize", measureHeader);
  }, [rendered, measureHeader]);

  useEffect(() => {
    if (!rendered) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }

    function handleTouchMove(event: TouchEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      const header = document.querySelector("[data-site-header]");
      if (header?.contains(target)) return;
      event.preventDefault();
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered]);

  const shopHref = `/${locale}/products`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        className={
          triggerClassName ??
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pideh-ink text-white transition-opacity hover:opacity-80 touch-manipulation sm:h-10 sm:w-10"
        }
        aria-label={open ? dictionary.nav.closeMenu : dictionary.nav.openMenu}
        aria-expanded={open}
        aria-controls={menuId}
      >
        {triggerContent ?? (
          <>
            <Menu
              className="pointer-events-none absolute h-4 w-4 transition-[opacity,transform] duration-[280ms] ease-out sm:h-5 sm:w-5"
              aria-hidden="true"
              style={{
                opacity: open ? 0 : 1,
                transform: open
                  ? "rotate(-90deg) scale(0.82)"
                  : "rotate(0deg) scale(1)",
              }}
            />
            <X
              className="pointer-events-none absolute h-4 w-4 transition-[opacity,transform] duration-[280ms] ease-out sm:h-5 sm:w-5"
              aria-hidden="true"
              style={{
                opacity: open ? 1 : 0,
                transform: open
                  ? "rotate(0deg) scale(1)"
                  : "rotate(90deg) scale(0.82)",
              }}
            />
          </>
        )}
      </button>

      {mounted && rendered
        ? createPortal(
            <div className="md:hidden">
              <button
                type="button"
                aria-label={dictionary.nav.closeMenu}
                className={`fixed inset-0 z-[60] cursor-pointer border-0 bg-pideh-ink/35 backdrop-blur-[10px] transition-[opacity,visibility] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  expanded
                    ? "pointer-events-auto visible opacity-100"
                    : "pointer-events-none invisible opacity-0"
                }`}
                onClick={() => setOpen(false)}
              />
              <div
                ref={panelRef}
                id={menuId}
                role="dialog"
                aria-modal="true"
                aria-label={dictionary.nav.navigation}
                className={`fixed z-[75] overflow-hidden rounded-[28px] bg-white px-6 shadow-[0_16px_40px_rgba(30,30,30,0.14)] transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  expanded
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-2.5 scale-[0.98] opacity-0"
                }`}
                style={{
                  top: panelTopPx + MENU_GAP_PX,
                  left: MENU_INSET_PX,
                  right: MENU_INSET_PX,
                  maxHeight: `calc(100dvh - ${panelTopPx + MENU_GAP_PX + MENU_INSET_PX}px)`,
                }}
              >
                <nav
                  aria-label={dictionary.nav.navigation}
                  className="flex max-h-inherit flex-col overflow-y-auto pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                >
                  <div className="flex flex-col py-4">
                    {navItems.map((item) => {
                      const active = isNavItemActive(
                        pathname,
                        item.href,
                        locale,
                      );
                      return (
                        <AppLink
                          key={item.href}
                          href={item.href}
                          prefetchPolicy="intent"
                          aria-current={active ? "page" : undefined}
                          className={`font-montserrat-arm rounded-xl px-1 py-3.5 text-[22px] leading-none font-black tracking-tight transition-colors ${
                            active
                              ? "text-pideh-orange"
                              : "text-pideh-ink hover:bg-pideh-cream hover:text-pideh-orange"
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </AppLink>
                      );
                    })}
                  </div>

                  <div className="border-t border-pideh-ink/10 py-5">
                    <AppLink
                      href={shopHref}
                      prefetchPolicy="intent"
                      className="font-montserrat-arm flex w-full items-center justify-center rounded-full bg-pideh-ink px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-pideh-orange"
                      onClick={() => setOpen(false)}
                    >
                      {dictionary.nav.shopNow}
                    </AppLink>
                  </div>
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

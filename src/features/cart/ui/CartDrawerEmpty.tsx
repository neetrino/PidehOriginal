"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { annotate } from "rough-notation";
import { useEffect, useRef } from "react";

import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";

type CartDrawerEmptyProps = {
  locale: Locale;
  empty: string;
  emptyDescription: string;
  emptyCta: string;
  onContinue: () => void;
};

export function CartDrawerEmpty({
  locale,
  empty,
  emptyDescription,
  emptyCta,
  onContinue,
}: CartDrawerEmptyProps) {
  const titleRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const titleEl = titleRef.current;
    if (!titleEl) {
      return;
    }
    const mark = annotate(titleEl, {
      type: "underline",
      color: "#ff6b00",
      animate: !reduceMotion,
      animationDuration: 700,
      padding: 4,
      strokeWidth: 2,
    });
    mark.show();
    return () => mark.remove();
  }, [empty, reduceMotion]);

  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-2 text-center">
      <motion.div
        className="flex size-28 items-center justify-center rounded-full bg-[#ff6b00] text-white shadow-[0_12px_28px_rgba(255,107,0,0.35)]"
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShoppingBag className="size-12" aria-hidden />
      </motion.div>
      <p
        ref={titleRef}
        className="mt-6 inline-block text-xl font-bold text-[#1e1e1e]"
      >
        {empty}
      </p>
      <p className="mt-3 max-w-[20rem] text-sm leading-relaxed text-[#1e1e1e]/60">
        {emptyDescription}
      </p>
      <AppLink
        href={`/${locale}/products`}
        prefetchPolicy="intent"
        onClick={onContinue}
        className="relative mt-7 inline-flex min-h-[52px] w-full max-w-sm items-center rounded-full bg-[#ff6b00] py-1.5 pr-1.5 pl-5 text-sm font-bold text-white transition hover:brightness-110"
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-12">
          {emptyCta}
        </span>
        <span className="relative ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20">
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </AppLink>
    </div>
  );
}

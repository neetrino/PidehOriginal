'use client';

import { useState, type ReactNode } from 'react';

import type { CheckoutPaymentMethod } from '@/features/checkout/domain/payment-methods';
import {
  CHECKOUT_PANEL,
  CHECKOUT_RADIO_OFF,
  CHECKOUT_RADIO_ON,
  CHECKOUT_SECTION_TITLE,
} from '@/features/checkout/ui/checkout-ui-classes';

export type PaymentOption = {
  id: CheckoutPaymentMethod;
  name: string;
  description: string;
  logos: string[];
};

type CheckoutPaymentMethodsProps = {
  title: string;
  options: PaymentOption[];
  value: CheckoutPaymentMethod;
  onChange: (method: CheckoutPaymentMethod) => void;
  disabled: boolean;
  /** Shown under the cash option while cash on delivery is selected. */
  afterCash?: ReactNode;
};

export function CheckoutPaymentMethods({
  title,
  options,
  value,
  onChange,
  disabled,
  afterCash,
}: CheckoutPaymentMethodsProps) {
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  return (
    <section className={CHECKOUT_PANEL}>
      <h2 className={CHECKOUT_SECTION_TITLE}>{title}</h2>
      <div className="space-y-3">
        {options.map((option) => {
          const selected = value === option.id;
          const logos = option.logos.filter((src) => !logoErrors[src]);
          const showFallback = logos.length === 0;

          return (
            <div key={option.id} className="space-y-3">
              <label
                className={`flex cursor-pointer items-center rounded-[18px] border-2 p-4 transition-colors ${
                  selected ? CHECKOUT_RADIO_ON : CHECKOUT_RADIO_OFF
                }`}
              >
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="mr-4 accent-[#ff6b00]"
                disabled={disabled}
              />
              <div className="flex flex-1 items-center gap-4">
                {showFallback ? (
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#ff6b00]/15 bg-white">
                    <svg
                      className="h-8 w-8 text-[#ff6b00]/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-1.5">
                    {logos.map((src) => (
                      <span
                        key={src}
                        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#ff6b00]/15 bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- payment logos */}
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-contain p-1"
                          loading="lazy"
                          onError={() => setLogoErrors((prev) => ({ ...prev, [src]: true }))}
                        />
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-bold text-[#1e1e1e]">{option.name}</div>
                  <div className="text-sm text-[#1e1e1e]/60">{option.description}</div>
                </div>
              </div>
            </label>
              {option.id === 'cash_on_delivery' && selected ? afterCash : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

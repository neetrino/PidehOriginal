'use client';

import type { CheckoutShippingMethod } from '@/features/checkout/domain/shipping-methods';

import {
  CHECKOUT_PANEL,
  CHECKOUT_RADIO_OFF,
  CHECKOUT_RADIO_ON,
  CHECKOUT_SECTION_TITLE,
} from '@/features/checkout/ui/checkout-ui-classes';

type ShippingOption = {
  id: CheckoutShippingMethod;
  name: string;
  description: string;
};

type CheckoutShippingMethodsProps = {
  title: string;
  options: ShippingOption[];
  value: CheckoutShippingMethod;
  onChange: (method: CheckoutShippingMethod) => void;
  disabled: boolean;
};

export function CheckoutShippingMethods({
  title,
  options,
  value,
  onChange,
  disabled,
}: CheckoutShippingMethodsProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <section className={CHECKOUT_PANEL}>
      <h2 className={CHECKOUT_SECTION_TITLE}>{title}</h2>
      <div className="space-y-3">
        {options.map((option) => {
          const selected = value === option.id;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center rounded-[18px] border-2 p-4 transition-colors ${
                selected ? CHECKOUT_RADIO_ON : CHECKOUT_RADIO_OFF
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="mr-4 accent-[#ff6b00]"
                disabled={disabled}
              />
              <div className="flex-1">
                <div className="font-bold text-[#1e1e1e]">{option.name}</div>
                <div className="text-sm text-[#1e1e1e]/60">{option.description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}

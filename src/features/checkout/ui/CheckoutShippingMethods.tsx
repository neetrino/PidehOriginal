"use client";

import type { CheckoutShippingMethod } from "@/features/checkout/domain/shipping-methods";

const RADIO_SELECTED = "border-gray-900 bg-gray-50";
const RADIO_IDLE = "border-gray-300 hover:bg-gray-50";

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
    <section className="rounded-2xl border border-gray-200/80 bg-white p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">{title}</h2>
      <div className="space-y-3">
        {options.map((option) => {
          const selected = value === option.id;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center rounded-lg border-2 p-4 transition-all ${
                selected ? RADIO_SELECTED : RADIO_IDLE
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                className="mr-4"
                disabled={disabled}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.name}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}

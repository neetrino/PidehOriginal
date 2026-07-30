"use client";

import { useEffect, useState } from "react";

import { quoteDistanceDeliveryAction } from "@/features/delivery/application/quote-distance-delivery";

const ADDRESS_QUOTE_DEBOUNCE_MS = 600;

export type DeliveryQuoteState = {
  deliveryAmount: number;
  distanceLabel: string | null;
  pending: boolean;
  error: string | null;
};

/**
 * Debounced distance-delivery quote for the checkout address field.
 */
export function useDistanceDeliveryQuote(line1: string): DeliveryQuoteState {
  const [deliveryAmount, setDeliveryAmount] = useState(0);
  const [distanceLabel, setDistanceLabel] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = line1.trim();
    if (trimmed.length < 3) {
      setDeliveryAmount(0);
      setDistanceLabel(null);
      setError(null);
      setPending(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setPending(true);
      void quoteDistanceDeliveryAction(trimmed).then((result) => {
        if (cancelled) return;
        setPending(false);
        if (!result.ok) {
          setDeliveryAmount(0);
          setDistanceLabel(null);
          setError(result.error);
          return;
        }
        setDeliveryAmount(result.quote.deliveryAmount);
        setDistanceLabel(result.quote.distanceLabel);
        setError(null);
      });
    }, ADDRESS_QUOTE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [line1]);

  return { deliveryAmount, distanceLabel, pending, error };
}

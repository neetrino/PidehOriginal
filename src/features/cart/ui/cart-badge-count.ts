'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * Header cart badge count published by client-side cart mutations.
 *
 * Add-to-cart deliberately skips the layout revalidation, so the badge is kept
 * in sync here instead of through a server re-render: it is bumped on the click
 * itself and corrected once the server reports the durable count. The override
 * is dropped as soon as a server render reports a different count, which makes
 * navigation and checkout the source of truth again.
 */
export type CartBadgeView = {
  count: number;
  /** True while an add is in flight — cart views must not refetch yet. */
  adding: boolean;
};

type CartBadgeState = {
  count: number | null;
  adding: boolean;
};

const IDLE: CartBadgeState = { count: null, adding: false };

let renderedCount = 0;
let override: number | null = null;
let inFlight = 0;
let state: CartBadgeState = IDLE;
const listeners = new Set<() => void>();

function publish(): void {
  state = override === null && inFlight === 0 ? IDLE : { count: override, adding: inFlight > 0 };
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartBadgeState {
  return state;
}

function getServerSnapshot(): CartBadgeState {
  return IDLE;
}

function syncRenderedCount(next: number): void {
  if (renderedCount === next) return;
  renderedCount = next;
  if (override === null || inFlight > 0) return;
  override = null;
  publish();
}

/**
 * Bumps the badge before the server responds, so the cart already shows the
 * product when the fly-to-cart animation lands.
 *
 * @returns settler to call with the durable count, or `null` when the add failed.
 */
export function beginCartBadgeAdd(quantity = 1): (count: number | null) => void {
  inFlight += 1;
  override = (override ?? renderedCount) + quantity;
  publish();

  return (count) => {
    inFlight = Math.max(inFlight - 1, 0);
    if (count !== null) {
      override = count;
    } else if (override !== null) {
      const rolledBack = Math.max(override - quantity, 0);
      override = rolledBack === renderedCount ? null : rolledBack;
    }
    publish();
  };
}

/**
 * Resolves the badge count, preferring a client-published count over the
 * server-rendered one until the server catches up.
 */
export function useCartBadge(serverCount: number): CartBadgeView {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    syncRenderedCount(serverCount);
  }, [serverCount]);

  return { count: current.count ?? serverCount, adding: current.adding };
}

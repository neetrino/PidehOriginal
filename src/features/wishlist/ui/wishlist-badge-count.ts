'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * Wishlist badge count published by the toggle button.
 *
 * Toggling deliberately skips the layout revalidation, so the badge is kept in
 * sync here instead of through a server re-render that would interrupt the
 * heart animation. The override is dropped as soon as a server render reports a
 * different count, which makes navigation the source of truth again.
 */
let renderedCount = 0;
let override: number | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number | null {
  return override;
}

function getServerSnapshot(): number | null {
  return null;
}

/** Publishes the count returned by a wishlist toggle. */
export function setWishlistBadgeCount(count: number): void {
  if (override === count) return;
  override = count;
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Resolves the badge count, preferring a client-published count over the
 * server-rendered one until the server catches up.
 */
export function useWishlistBadgeCount(serverCount: number): number {
  const published = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (renderedCount === serverCount) return;
    renderedCount = serverCount;
    if (override === null) return;
    override = null;
    for (const listener of listeners) {
      listener();
    }
  }, [serverCount]);

  return published ?? serverCount;
}

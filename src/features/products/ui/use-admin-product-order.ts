'use client';

import { useEffect, useRef, useState, type TransitionStartFunction } from 'react';

import { reorderProductsAction } from '@/features/products/application/admin-product-actions';
import type { AdminProductListItem } from '@/features/products/application/list-admin-products';

function moveItem(
  list: AdminProductListItem[],
  fromIndex: number,
  toIndex: number,
): AdminProductListItem[] {
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return list;
  const next = [...list];
  const [item] = next.splice(fromIndex, 1);
  if (!item) return list;
  next.splice(toIndex, 0, item);
  return next;
}

function sameOrder(left: AdminProductListItem[], right: AdminProductListItem[]): boolean {
  return left.length === right.length && left.every((item, index) => item.id === right[index]?.id);
}

type UseAdminProductOrderOptions = {
  locale: string;
  products: AdminProductListItem[];
  canReorder: boolean;
  startTransition: TransitionStartFunction;
  onError: (message: string | null) => void;
  onSaved: () => void;
};

/** Local drag order for the admin product table, persisted as shop sort order. */
export function useAdminProductOrder({
  locale,
  products,
  canReorder,
  startTransition,
  onError,
  onSaved,
}: UseAdminProductOrderOptions) {
  const [ordered, setOrdered] = useState(products);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const orderedRef = useRef(ordered);
  const dragOriginRef = useRef<AdminProductListItem[] | null>(null);
  const persistedRef = useRef(false);

  useEffect(() => {
    setOrdered(products);
    orderedRef.current = products;
  }, [products]);

  function persistCurrentOrder(): void {
    if (!canReorder || persistedRef.current) return;
    const next = orderedRef.current;
    const previous = dragOriginRef.current;
    dragOriginRef.current = null;
    if (!previous || sameOrder(previous, next)) return;

    persistedRef.current = true;
    startTransition(async () => {
      onError(null);
      const result = await reorderProductsAction(locale, {
        orderedIds: next.map((product) => product.id),
      });
      if (!result.ok) {
        setOrdered(previous);
        orderedRef.current = previous;
        onError(result.error.message);
        return;
      }
      onSaved();
    });
  }

  function reorderToward(targetId: string): void {
    if (!draggingId || !canReorder || draggingId === targetId) return;
    setOrdered((current) => {
      const fromIndex = current.findIndex((product) => product.id === draggingId);
      const toIndex = current.findIndex((product) => product.id === targetId);
      const next = moveItem(current, fromIndex, toIndex);
      orderedRef.current = next;
      return next;
    });
  }

  function beginDrag(productId: string): void {
    dragOriginRef.current = orderedRef.current;
    persistedRef.current = false;
    setDraggingId(productId);
  }

  function endDrag(): void {
    persistCurrentOrder();
    setDraggingId(null);
  }

  return { ordered, draggingId, reorderToward, beginDrag, endDrag, persistCurrentOrder };
}

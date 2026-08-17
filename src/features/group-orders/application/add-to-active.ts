"use server";

import { addToCart } from "@/features/cart/cart";
import { addGroupOrderItem } from "@/features/group-orders/application/items";
import { peekGroupOrderSession } from "@/features/group-orders/session";

/**
 * Adds to the active group order when a session cookie is present;
 * otherwise falls back to the personal cart.
 */
export async function addProductToActiveCart(
  productId: string,
  quantity: number,
  options?: { modifierIds?: string[] },
): Promise<{ ok: true; target: "group" | "cart" } | { ok: false; error: string }> {
  const session = await peekGroupOrderSession();
  if (session.inviteToken && session.participantId) {
    const result = await addGroupOrderItem({
      inviteToken: session.inviteToken,
      productId,
      quantity,
      modifierIds: options?.modifierIds,
    });
    if (!result.ok) return result;
    return { ok: true, target: "group" };
  }

  try {
    await addToCart(productId, quantity, options);
    return { ok: true, target: "cart" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to add to cart.",
    };
  }
}

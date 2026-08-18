import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  cartItemModifiers,
  cartItems,
  groupOrderItemModifiers,
  groupOrderItems,
} from "@/db/schema";
import { getOrCreateCart } from "@/features/cart/cart";
import { assertOrganizerAccess } from "@/features/group-orders/application/access";
import { createId } from "@/lib/id";

export type PrepareGroupOrderCheckoutResult =
  | { ok: true; inviteToken: string }
  | { ok: false; error: string };

/**
 * Copies locked group-order lines into the organizer's personal cart
 * so the standard storefront checkout page can be used.
 */
export async function prepareGroupOrderCheckout(
  inviteToken: string,
): Promise<PrepareGroupOrderCheckoutResult> {
  const access = await assertOrganizerAccess(inviteToken);
  if (!access.ok) return access;

  if (access.groupOrder.status !== "CHECKOUT") {
    return {
      ok: false,
      error: "Group order is not ready for checkout yet.",
    };
  }

  const db = getDb();
  const lines = await db
    .select()
    .from(groupOrderItems)
    .where(eq(groupOrderItems.groupOrderId, access.groupOrder.id));

  if (lines.length === 0) {
    return { ok: false, error: "No items to checkout." };
  }

  const cart = await getOrCreateCart();
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

  const lineIds = lines.map((line) => line.id);
  const allModifiers = await db
    .select()
    .from(groupOrderItemModifiers)
    .where(inArray(groupOrderItemModifiers.groupOrderItemId, lineIds));

  const modsByItem = new Map<string, typeof allModifiers>();
  for (const mod of allModifiers) {
    const list = modsByItem.get(mod.groupOrderItemId) ?? [];
    list.push(mod);
    modsByItem.set(mod.groupOrderItemId, list);
  }

  for (const line of lines) {
    const [existing] = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, line.productId),
          eq(cartItems.selectionKey, line.selectionKey),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(cartItems)
        .set({
          quantity: existing.quantity + line.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existing.id));
      continue;
    }

    const itemId = createId();
    await db.insert(cartItems).values({
      id: itemId,
      cartId: cart.id,
      productId: line.productId,
      selectionKey: line.selectionKey,
      quantity: line.quantity,
    });

    const itemMods = modsByItem.get(line.id) ?? [];
    if (itemMods.length > 0) {
      await db.insert(cartItemModifiers).values(
        itemMods.map((mod) => ({
          id: createId(),
          cartItemId: itemId,
          modifierId: mod.modifierId,
        })),
      );
    }
  }

  return { ok: true, inviteToken };
}

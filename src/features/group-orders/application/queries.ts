import { and, asc, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  groupOrderEvents,
  groupOrderItemModifiers,
  groupOrderItems,
  groupOrderParticipants,
  groupOrders,
  mediaAssets,
  products,
} from "@/db/schema";
import type { LocaleTranslation, TranslationsJson } from "@/db/schema/catalog";
import { buildInvitePath } from "@/features/group-orders/application/money";
import type { GroupOrderPaymentMode } from "@/features/group-orders/domain/status";
import type { AdminGroupOrdersFilter } from "@/features/group-orders/schemas";
import type { Locale } from "@/lib/i18n/config";
import { mediaPublicUrl } from "@/lib/media/public-url";
import { formatMoneyAmount } from "@/lib/money/format";
import type { Currency } from "@/lib/money/currency";
import { peekGroupOrderSession } from "@/features/group-orders/session";

export type GroupOrderItemView = {
  id: string;
  participantId: string;
  productId: string;
  title: string;
  imageUrl: string | null;
  quantity: number;
  unitAmount: number;
  lineTotalAmount: number;
  lineTotalFormatted: string;
  modifierSummary: string | null;
};

export type GroupOrderParticipantView = {
  id: string;
  displayName: string;
  role: "ORGANIZER" | "PARTICIPANT";
  status: string;
  paymentStatus: string;
  subtotalAmount: number;
  subtotalFormatted: string;
  deliveryShareAmount: number;
  deliveryShareFormatted: string;
  finalAmount: number;
  finalAmountFormatted: string;
  itemsReady: boolean;
  items: GroupOrderItemView[];
};

export type GroupOrderDetailView = {
  id: string;
  inviteToken: string;
  invitePath: string;
  organizerDisplayName: string;
  paymentMode: GroupOrderPaymentMode;
  status: string;
  spendLimitAmount: number | null;
  spendLimitFormatted: string | null;
  joinsClosed: boolean;
  deliveryAmount: number;
  deliveryFormatted: string;
  deliveryAddress: string | null;
  deliveryDistanceLabel: string | null;
  lockedAt: string | null;
  expiresAt: string;
  currentParticipantId: string | null;
  currentParticipantRole: "ORGANIZER" | "PARTICIPANT" | null;
  merchandiseTotalAmount: number;
  merchandiseTotalFormatted: string;
  grandTotalAmount: number;
  grandTotalFormatted: string;
  participants: GroupOrderParticipantView[];
  events: Array<{
    id: string;
    eventType: string;
    fromState: string | null;
    toState: string | null;
    createdAt: string;
    payload: Record<string, unknown> | null;
  }>;
};

function productTitle(
  translations: TranslationsJson,
  locale: Locale,
  fallbackSku: string,
): string {
  const entry: LocaleTranslation | undefined =
    translations[locale] ?? translations.hy;
  return entry?.title ?? fallbackSku;
}

export async function getGroupOrderDetailByInvite(input: {
  inviteToken: string;
  locale: Locale;
  currency: Currency;
}): Promise<GroupOrderDetailView | null> {
  const db = getDb();
  const [groupOrder] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.inviteToken, input.inviteToken))
    .limit(1);
  if (!groupOrder) return null;

  const participants = await db
    .select()
    .from(groupOrderParticipants)
    .where(eq(groupOrderParticipants.groupOrderId, groupOrder.id))
    .orderBy(asc(groupOrderParticipants.createdAt));

  const items = await db
    .select({
      item: groupOrderItems,
      product: products,
    })
    .from(groupOrderItems)
    .innerJoin(products, eq(groupOrderItems.productId, products.id))
    .where(eq(groupOrderItems.groupOrderId, groupOrder.id));

  const itemIds = items.map((row) => row.item.id);
  const modifierRows =
    itemIds.length === 0
      ? []
      : await db
          .select()
          .from(groupOrderItemModifiers)
          .where(inArray(groupOrderItemModifiers.groupOrderItemId, itemIds));

  const modifiersByItem = new Map<string, typeof modifierRows>();
  for (const row of modifierRows) {
    const list = modifiersByItem.get(row.groupOrderItemId) ?? [];
    list.push(row);
    modifiersByItem.set(row.groupOrderItemId, list);
  }

  const productIds = [...new Set(items.map((row) => row.product.id))];
  const mediaRows =
    productIds.length === 0
      ? []
      : await db
          .select()
          .from(mediaAssets)
          .where(
            and(
              inArray(mediaAssets.productId, productIds),
              eq(mediaAssets.role, "PRIMARY"),
              eq(mediaAssets.uploadStatus, "READY"),
            ),
          );

  const imageByProduct = new Map(
    mediaRows.map((row) => [row.productId!, mediaPublicUrl(row.objectKey)]),
  );

  const format = (amount: number) =>
    formatMoneyAmount(amount, input.currency, input.locale);

  const participantViews: GroupOrderParticipantView[] = participants
    .filter((p) => p.status === "ACTIVE")
    .map((participant) => {
      const ownItems = items
        .filter((row) => row.item.participantId === participant.id)
        .map((row) => {
          const mods = modifiersByItem.get(row.item.id) ?? [];
          const modifierSummary =
            mods.length > 0
              ? mods.map((m) => m.nameSnapshot).join(", ")
              : null;
          return {
            id: row.item.id,
            participantId: participant.id,
            productId: row.product.id,
            title: productTitle(
              row.product.translations,
              input.locale,
              row.product.sku,
            ),
            imageUrl: imageByProduct.get(row.product.id) ?? null,
            quantity: row.item.quantity,
            unitAmount: row.item.unitAmount,
            lineTotalAmount: row.item.lineTotalAmount,
            lineTotalFormatted: format(row.item.lineTotalAmount),
            modifierSummary,
          };
        });

      return {
        id: participant.id,
        displayName: participant.displayName,
        role: participant.role,
        status: participant.status,
        paymentStatus: participant.paymentStatus,
        subtotalAmount: participant.subtotalAmount,
        subtotalFormatted: format(participant.subtotalAmount),
        deliveryShareAmount: participant.deliveryShareAmount,
        deliveryShareFormatted: format(participant.deliveryShareAmount),
        finalAmount: participant.finalAmount,
        finalAmountFormatted: format(participant.finalAmount),
        itemsReady: participant.itemsReady,
        items: ownItems,
      };
    });

  const merchandiseTotalAmount = participantViews.reduce(
    (sum, p) => sum + p.subtotalAmount,
    0,
  );
  const grandTotalAmount = merchandiseTotalAmount + groupOrder.deliveryAmount;

  const session = await peekGroupOrderSession();
  let currentParticipantId: string | null = null;
  let currentParticipantRole: "ORGANIZER" | "PARTICIPANT" | null = null;
  if (session.inviteToken === input.inviteToken && session.participantId) {
    const match = participantViews.find((p) => p.id === session.participantId);
    if (match) {
      currentParticipantId = match.id;
      currentParticipantRole = match.role;
    }
  }

  const events = await db
    .select()
    .from(groupOrderEvents)
    .where(eq(groupOrderEvents.groupOrderId, groupOrder.id))
    .orderBy(desc(groupOrderEvents.createdAt))
    .limit(50);

  return {
    id: groupOrder.id,
    inviteToken: groupOrder.inviteToken,
    invitePath: buildInvitePath(input.locale, groupOrder.inviteToken),
    organizerDisplayName: groupOrder.organizerDisplayName,
    paymentMode: groupOrder.paymentMode,
    status: groupOrder.status,
    spendLimitAmount: groupOrder.spendLimitAmount,
    spendLimitFormatted:
      groupOrder.spendLimitAmount != null
        ? format(groupOrder.spendLimitAmount)
        : null,
    joinsClosed: groupOrder.joinsClosed,
    deliveryAmount: groupOrder.deliveryAmount,
    deliveryFormatted: format(groupOrder.deliveryAmount),
    deliveryAddress: groupOrder.deliveryAddress,
    deliveryDistanceLabel: groupOrder.deliveryDistanceLabel,
    lockedAt: groupOrder.lockedAt?.toISOString() ?? null,
    expiresAt: groupOrder.expiresAt.toISOString(),
    currentParticipantId,
    currentParticipantRole,
    merchandiseTotalAmount,
    merchandiseTotalFormatted: format(merchandiseTotalAmount),
    grandTotalAmount,
    grandTotalFormatted: format(grandTotalAmount),
    participants: participantViews,
    events: events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      fromState: event.fromState,
      toState: event.toState,
      createdAt: event.createdAt.toISOString(),
      payload: event.payload,
    })),
  };
}

export type AdminGroupOrderListItem = {
  id: string;
  inviteToken: string;
  organizerDisplayName: string;
  paymentMode: string;
  status: string;
  participantCount: number;
  totalAmount: number;
  deliveryAmount: number;
  createdAt: string;
  /** Preformatted for stable SSR/client display (Asia/Yerevan). */
  createdTime: string;
  createdDate: string;
  orderId: string | null;
};

const ADMIN_GROUP_ORDERS_PAGE_SIZE = 50;
const ADMIN_LIST_TIME_ZONE = "Asia/Yerevan";

function formatAdminCreatedParts(value: Date): {
  time: string;
  date: string;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ADMIN_LIST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(value);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    time: `${get("hour")}:${get("minute")}`,
    date: `${get("day")}.${get("month")}.${get("year")}`,
  };
}

function buildAdminGroupOrderFilters(
  filters: AdminGroupOrdersFilter,
): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.status) {
    conditions.push(eq(groupOrders.status, filters.status));
  }
  if (filters.paymentMode) {
    conditions.push(eq(groupOrders.paymentMode, filters.paymentMode));
  }
  if (filters.q) {
    const pattern = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(groupOrders.organizerDisplayName, pattern),
        sql`${groupOrders.id}::text ilike ${pattern}`,
      )!,
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

/** Lists group orders for the admin surface with optional status/mode/search filters. */
export async function listAdminGroupOrders(
  filters: AdminGroupOrdersFilter = { page: 1 },
): Promise<{
  rows: AdminGroupOrderListItem[];
  total: number;
  pageSize: number;
}> {
  const where = buildAdminGroupOrderFilters(filters);
  const offset = (filters.page - 1) * ADMIN_GROUP_ORDERS_PAGE_SIZE;
  const db = getDb();

  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(groupOrders)
      .where(where)
      .orderBy(desc(groupOrders.createdAt))
      .limit(ADMIN_GROUP_ORDERS_PAGE_SIZE)
      .offset(offset),
    db.select({ value: count() }).from(groupOrders).where(where),
  ]);

  if (rows.length === 0) {
    return {
      rows: [],
      total: totalRow?.value ?? 0,
      pageSize: ADMIN_GROUP_ORDERS_PAGE_SIZE,
    };
  }

  const ids = rows.map((row) => row.id);
  const statsRows = await db
    .select({
      groupOrderId: groupOrderParticipants.groupOrderId,
      participantCount: count(),
      merchandiseTotal: sql<number>`coalesce(sum(${groupOrderParticipants.subtotalAmount}), 0)::int`,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        inArray(groupOrderParticipants.groupOrderId, ids),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    )
    .groupBy(groupOrderParticipants.groupOrderId);

  const statsById = new Map(
    statsRows.map((row) => [
      row.groupOrderId,
      {
        participantCount: row.participantCount,
        merchandiseTotal: Number(row.merchandiseTotal),
      },
    ]),
  );

  return {
    rows: rows.map((row) => {
      const stats = statsById.get(row.id);
      const merchandiseTotal = stats?.merchandiseTotal ?? 0;
      const created = formatAdminCreatedParts(row.createdAt);
      return {
        id: row.id,
        inviteToken: row.inviteToken,
        organizerDisplayName: row.organizerDisplayName,
        paymentMode: row.paymentMode,
        status: row.status,
        participantCount: stats?.participantCount ?? 0,
        totalAmount: merchandiseTotal + row.deliveryAmount,
        deliveryAmount: row.deliveryAmount,
        createdAt: row.createdAt.toISOString(),
        createdTime: created.time,
        createdDate: created.date,
        orderId: row.orderId,
      };
    }),
    total: totalRow?.value ?? 0,
    pageSize: ADMIN_GROUP_ORDERS_PAGE_SIZE,
  };
}

export async function getAdminGroupOrderDetail(input: {
  groupOrderId: string;
  locale: Locale;
  currency: Currency;
}): Promise<GroupOrderDetailView | null> {
  const [row] = await getDb()
    .select({ inviteToken: groupOrders.inviteToken })
    .from(groupOrders)
    .where(eq(groupOrders.id, input.groupOrderId))
    .limit(1);
  if (!row) return null;
  return getGroupOrderDetailByInvite({
    inviteToken: row.inviteToken,
    locale: input.locale,
    currency: input.currency,
  });
}

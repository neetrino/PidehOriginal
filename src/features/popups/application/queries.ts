import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDb } from "@/db/client";
import { mediaAssets, storePopups } from "@/db/schema";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import { mediaPublicUrl } from "@/lib/media/public-url";

export type AdminPopupListItem = {
  id: string;
  title: string;
  linkUrl: string | null;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
};

export type StorefrontPopup = {
  id: string;
  title: string;
  linkUrl: string | null;
  imageUrl: string;
};

async function loadPopupImageUrls(
  popupIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (popupIds.length === 0) {
    return map;
  }

  const rows = await getDb()
    .select({
      popupId: mediaAssets.popupId,
      objectKey: mediaAssets.objectKey,
    })
    .from(mediaAssets)
    .where(
      and(
        inArray(mediaAssets.popupId, popupIds),
        eq(mediaAssets.uploadStatus, "READY"),
        eq(mediaAssets.role, "POPUP"),
      ),
    );

  for (const row of rows) {
    if (row.popupId) {
      map.set(row.popupId, mediaPublicUrl(row.objectKey));
    }
  }

  return map;
}

/** Lists all storefront popups for admin CMS. */
export async function listAdminPopups(): Promise<AdminPopupListItem[]> {
  const rows = await getDb()
    .select()
    .from(storePopups)
    .orderBy(desc(storePopups.createdAt));

  const images = await loadPopupImageUrls(rows.map((row) => row.id));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    linkUrl: row.linkUrl,
    isActive: row.isActive,
    imageUrl: images.get(row.id) ?? null,
    createdAt: row.createdAt,
  }));
}

async function loadActiveStorefrontPopup(): Promise<StorefrontPopup | null> {
  const [row] = await getDb()
    .select()
    .from(storePopups)
    .where(eq(storePopups.isActive, true))
    .orderBy(asc(storePopups.createdAt))
    .limit(1);

  if (!row) {
    return null;
  }

  const images = await loadPopupImageUrls([row.id]);
  const imageUrl = images.get(row.id);
  if (!imageUrl) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    linkUrl: row.linkUrl,
    imageUrl,
  };
}

/** Active popup for storefront overlay (null when none or missing image). */
export async function getActiveStorefrontPopup(): Promise<StorefrontPopup | null> {
  return unstable_cache(
    async () => loadActiveStorefrontPopup(),
    ["active-storefront-popup"],
    {
      tags: [CACHE_TAGS.popups],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}

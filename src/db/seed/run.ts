import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { hashPassword } from "@/lib/auth/password";
import * as schema from "@/db/schema";
import {
  seedCatalogProducts,
  seedPideCategory,
  seedProductCategoryLinks,
  seedProductMedia,
} from "@/db/seed/catalog";
import { getSeedEnv } from "@/db/seed/env";
import { seedIds } from "@/db/seed/ids";

async function seed(): Promise<void> {
  const env = getSeedEnv();
  const db = drizzle(neon(env.DATABASE_URL), { schema });

  const now = new Date();
  const adminPasswordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);
  const customerEmail = env.SEED_CUSTOMER_EMAIL ?? "customer@white-shop.local";
  const customerPassword = env.SEED_CUSTOMER_PASSWORD ?? env.SEED_ADMIN_PASSWORD;
  const customerPasswordHash = await hashPassword(customerPassword);

  await db
    .insert(schema.users)
    .values({
      id: seedIds.adminUser,
      email: env.SEED_ADMIN_EMAIL.toLowerCase(),
      emailVerifiedAt: now,
      passwordHash: adminPasswordHash,
      passwordUpdatedAt: now,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      status: "ACTIVE",
      termsAcceptedAt: now,
      termsVersion: "1.0",
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        email: env.SEED_ADMIN_EMAIL.toLowerCase(),
        passwordHash: adminPasswordHash,
        passwordUpdatedAt: now,
        role: "ADMIN",
        status: "ACTIVE",
        updatedAt: now,
      },
    });

  await db
    .insert(schema.users)
    .values({
      id: seedIds.customerUser,
      email: customerEmail.toLowerCase(),
      emailVerifiedAt: now,
      passwordHash: customerPasswordHash,
      passwordUpdatedAt: now,
      firstName: "Demo",
      lastName: "Customer",
      role: "CUSTOMER",
      status: "ACTIVE",
      termsAcceptedAt: now,
      termsVersion: "1.0",
    })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        email: customerEmail.toLowerCase(),
        passwordHash: customerPasswordHash,
        passwordUpdatedAt: now,
        role: "CUSTOMER",
        status: "ACTIVE",
        updatedAt: now,
      },
    });

  await db
    .insert(schema.categories)
    .values(seedPideCategory)
    .onConflictDoUpdate({
      target: schema.categories.id,
      set: {
        translations: seedPideCategory.translations,
        status: "ACTIVE",
        updatedAt: now,
      },
    });

  await db
    .insert(schema.products)
    .values([...seedCatalogProducts])
    .onConflictDoUpdate({
      target: schema.products.id,
      set: {
        status: "ACTIVE",
        updatedAt: now,
      },
    });

  await db
    .insert(schema.productCategories)
    .values([...seedProductCategoryLinks])
    .onConflictDoNothing({ target: schema.productCategories.id });

  await db
    .insert(schema.mediaAssets)
    .values(seedProductMedia)
    .onConflictDoUpdate({
      target: schema.mediaAssets.id,
      set: {
        uploadStatus: "READY",
        isPrimary: true,
        updatedAt: now,
      },
    });

  await db
    .insert(schema.deliveryRules)
    .values({
      id: seedIds.deliveryArmenia,
      countryCode: "Armenia",
      city: "Yerevan",
      priceAmount: 1500,
      freeThresholdAmount: 50000,
      estimatedDaysMin: 1,
      estimatedDaysMax: 3,
      isActive: true,
      priority: 100,
    })
    .onConflictDoUpdate({
      target: schema.deliveryRules.id,
      set: {
        isActive: true,
        countryCode: "Armenia",
        city: "Yerevan",
        priceAmount: 1500,
        freeThresholdAmount: 50000,
        updatedAt: now,
      },
    });

  await db
    .insert(schema.heroSlides)
    .values({
      id: seedIds.heroHome,
      translations: {
        hy: {
          title: "White Shop",
          subtitle: "New collection",
          buttonLabel: "Դիտել",
          buttonUrl: "/hy/products",
        },
        en: {
          title: "White Shop",
          subtitle: "New collection",
          buttonLabel: "Browse",
          buttonUrl: "/en/products",
        },
        ru: {
          title: "White Shop",
          subtitle: "New collection",
          buttonLabel: "Смотреть",
          buttonUrl: "/ru/products",
        },
      },
      sortOrder: 1,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: schema.heroSlides.id,
      set: {
        translations: {
          hy: {
            title: "White Shop",
            subtitle: "New collection",
            buttonLabel: "Դիտել",
            buttonUrl: "/hy/products",
          },
          en: {
            title: "White Shop",
            subtitle: "New collection",
            buttonLabel: "Browse",
            buttonUrl: "/en/products",
          },
          ru: {
            title: "White Shop",
            subtitle: "New collection",
            buttonLabel: "Смотреть",
            buttonUrl: "/ru/products",
          },
        },
        isActive: true,
        updatedAt: now,
      },
    });

  await db
    .insert(schema.promotions)
    .values({
      id: seedIds.promoWelcome,
      kind: "COUPON",
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxDiscountAmount: 5000,
      minimumOrderAmount: 10000,
      totalUsageLimit: 1000,
      perUserUsageLimit: 1,
      isActive: true,
      priority: 10,
      allowStacking: false,
      startsAt: now,
    })
    .onConflictDoUpdate({
      target: schema.promotions.id,
      set: {
        isActive: true,
        discountValue: 10,
        updatedAt: now,
      },
    });

  await db
    .insert(schema.blogPosts)
    .values({
      id: seedIds.blogWelcome,
      authorUserId: seedIds.adminUser,
      status: "PUBLISHED",
      publishedAt: now,
      translations: {
        hy: {
          title: "Welcome to White Shop",
          slug: "bari-galust",
          excerpt: "Store launch",
          content: "<p>White Shop is ready.</p>",
        },
        en: {
          title: "Welcome to White Shop",
          slug: "welcome",
          excerpt: "Store launch note",
          content: "<p>White Shop is ready.</p>",
        },
        ru: {
          title: "Welcome to White Shop",
          slug: "dobro-pozhalovat",
          excerpt: "Store launch",
          content: "<p>White Shop is ready.</p>",
        },
      },
      tags: ["news", "launch"],
    })
    .onConflictDoUpdate({
      target: schema.blogPosts.id,
      set: {
        status: "PUBLISHED",
        updatedAt: now,
      },
    });

  await db
    .insert(schema.storeSettings)
    .values([
      {
        key: "store.identity",
        value: {
          version: 1,
          name: "White Shop",
          defaultLocale: "hy",
          defaultCurrency: "AMD",
        },
      },
      {
        key: "store.maintenance",
        value: { version: 1, enabled: false },
      },
    ])
    .onConflictDoUpdate({
      target: schema.storeSettings.key,
      set: {
        updatedAt: now,
      },
    });

  await db
    .insert(schema.appMeta)
    .values({
      key: "seed.version",
      value: "2",
    })
    .onConflictDoUpdate({
      target: schema.appMeta.key,
      set: {
        value: "2",
        updatedAt: now,
      },
    });

  console.info(
    JSON.stringify({
      level: "info",
      message: "seed.complete",
      adminEmail: env.SEED_ADMIN_EMAIL.toLowerCase(),
      customerEmail: customerEmail.toLowerCase(),
      products: seedCatalogProducts.map((product) => product.sku),
      coupon: "WELCOME10",
    }),
  );
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(
    JSON.stringify({ level: "error", message: "seed.failed", error: message }),
  );
  process.exitCode = 1;
});

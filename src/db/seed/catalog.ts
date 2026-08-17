import type { TranslationsJson } from "@/db/schema";
import { seedIds } from "@/db/seed/ids";

function copy(
  hy: { title: string; slug: string; description: string },
  en: { title: string; slug: string; description: string },
  ru: { title: string; slug: string; description: string },
): TranslationsJson {
  return { hy, en, ru };
}

export const seedPideCategory = {
  id: seedIds.categoryApparel,
  translations: copy(
    {
      title: "Փիդե",
      slug: "pide",
      description: "Թարմ փիդեի տեսականի",
    },
    {
      title: "Pide",
      slug: "pide",
      description: "Fresh pide selection",
    },
    {
      title: "Пиде",
      slug: "pide",
      description: "Свежая пиде",
    },
  ),
  sortOrder: 1,
  status: "ACTIVE" as const,
};

export const seedCatalogProducts = [
  {
    id: seedIds.productTee,
    sku: "PD-ADANA-001",
    translations: copy(
      {
        title: "Ադանա փիդե",
        slug: "adana-pide",
        description: "Համեմված աղացած միս, պղպեղ և լոլիկի մածուկ",
      },
      {
        title: "Adana pide",
        slug: "adana-pide",
        description: "Spiced minced meat, pepper, and tomato paste",
      },
      {
        title: "Пиде Адана",
        slug: "adana-pide",
        description: "Пряный фарш, перец и томатная паста",
      },
    ),
    priceAmount: 1800,
    compareAtAmount: 2000,
    stockOnHand: 40,
    lowStockThreshold: 5,
    status: "ACTIVE" as const,
    isFeatured: true,
  },
  {
    id: seedIds.productHoodie,
    sku: "PD-CHEESE-001",
    translations: copy(
      {
        title: "Պանրով փիդե",
        slug: "panrov-pide",
        description: "Հալած պանիր և կանաչի տնական խմորի վրա",
      },
      {
        title: "Cheese pide",
        slug: "cheese-pide",
        description: "Melted cheese and herbs on house dough",
      },
      {
        title: "Сырная пиде",
        slug: "syrnaya-pide",
        description: "Плавленый сыр и зелень на домашнем тесте",
      },
    ),
    priceAmount: 1500,
    compareAtAmount: null,
    stockOnHand: 45,
    lowStockThreshold: 5,
    status: "ACTIVE" as const,
    isFeatured: true,
  },
  {
    id: seedIds.productPepperoni,
    sku: "PD-PEPPERONI-001",
    translations: copy(
      {
        title: "Պեպերոնիով փիդե",
        slug: "peperoniov-pide",
        description: "Պեպերոնի և պանիր՝ ոսկեգույն թխվածքով",
      },
      {
        title: "Pepperoni pide",
        slug: "pepperoni-pide",
        description: "Pepperoni and cheese with a golden crust",
      },
      {
        title: "Пиде с пепперони",
        slug: "pide-pepperoni",
        description: "Пепперони и сыр на золотистой корочке",
      },
    ),
    priceAmount: 950,
    compareAtAmount: null,
    stockOnHand: 35,
    lowStockThreshold: 5,
    status: "ACTIVE" as const,
    isFeatured: true,
  },
  {
    id: seedIds.productChicken,
    sku: "PD-CHICKEN-001",
    translations: copy(
      {
        title: "Հավով փիդե",
        slug: "havov-pide",
        description: "Հավի ֆիլե, պանիր, սունկ և եգիպտացորեն",
      },
      {
        title: "Chicken pide",
        slug: "chicken-pide",
        description: "Chicken tenderloin, cheese, mushrooms, and corn",
      },
      {
        title: "Куриная пиде",
        slug: "kurinaya-pide",
        description: "Куриное филе, сыр, грибы и кукуруза",
      },
    ),
    priceAmount: 1600,
    compareAtAmount: null,
    stockOnHand: 30,
    lowStockThreshold: 4,
    status: "ACTIVE" as const,
    isFeatured: true,
  },
  {
    id: seedIds.productMixed,
    sku: "PD-HAM-CHICKEN-001",
    translations: copy(
      {
        title: "Խոզապուխտով և հավի մսով փիդե",
        slug: "khozapukhtov-havov-pide",
        description: "Խոզապուխտ, հավի միս և հալած պանիր",
      },
      {
        title: "Ham and chicken pide",
        slug: "ham-chicken-pide",
        description: "Ham, chicken, and melted cheese",
      },
      {
        title: "Пиде с ветчиной и курицей",
        slug: "pide-vetchina-kuritsa",
        description: "Ветчина, курица и плавленый сыр",
      },
    ),
    priceAmount: 950,
    compareAtAmount: 1200,
    stockOnHand: 28,
    lowStockThreshold: 4,
    status: "ACTIVE" as const,
    isFeatured: true,
  },
] as const;

export const seedProductCategoryLinks = [
  {
    id: seedIds.productCategoryTee,
    productId: seedIds.productTee,
    categoryId: seedIds.categoryApparel,
    isPrimary: true,
    sortOrder: 1,
  },
  {
    id: seedIds.productCategoryHoodie,
    productId: seedIds.productHoodie,
    categoryId: seedIds.categoryApparel,
    isPrimary: true,
    sortOrder: 2,
  },
  {
    id: seedIds.productCategoryPepperoni,
    productId: seedIds.productPepperoni,
    categoryId: seedIds.categoryApparel,
    isPrimary: true,
    sortOrder: 3,
  },
  {
    id: seedIds.productCategoryChicken,
    productId: seedIds.productChicken,
    categoryId: seedIds.categoryApparel,
    isPrimary: true,
    sortOrder: 4,
  },
  {
    id: seedIds.productCategoryMixed,
    productId: seedIds.productMixed,
    categoryId: seedIds.categoryApparel,
    isPrimary: true,
    sortOrder: 5,
  },
] as const;

export const seedProductMedia = [
  {
    id: seedIds.mediaAdana,
    objectKey: "brand/pideh/food-pide.webp",
    productId: seedIds.productTee,
    altHy: "Ադանա փիդե",
    altEn: "Adana pide",
    altRu: "Пиде Адана",
  },
  {
    id: seedIds.mediaCheese,
    objectKey: "brand/pideh/cta-pide.webp",
    productId: seedIds.productHoodie,
    altHy: "Պանրով փիդե",
    altEn: "Cheese pide",
    altRu: "Сырная пиде",
  },
  {
    id: seedIds.mediaPepperoni,
    objectKey: "brand/pideh/category-pide.webp",
    productId: seedIds.productPepperoni,
    altHy: "Պեպերոնիով փիդե",
    altEn: "Pepperoni pide",
    altRu: "Пиде с пепперони",
  },
  {
    id: seedIds.mediaChicken,
    objectKey: "brand/pideh/about-slide-pide.webp",
    productId: seedIds.productChicken,
    altHy: "Հավով փիդե",
    altEn: "Chicken pide",
    altRu: "Куриная пиде",
  },
  {
    id: seedIds.mediaMixed,
    objectKey: "brand/pideh/about-slide-spread.webp",
    productId: seedIds.productMixed,
    altHy: "Խոզապուխտով և հավի մսով փիդե",
    altEn: "Ham and chicken pide",
    altRu: "Пиде с ветчиной и курицей",
  },
].map((item) => ({
  id: item.id,
  objectKey: item.objectKey,
  mimeType: "image/webp",
  byteSize: 80_000,
  uploadStatus: "READY" as const,
  role: "PRIMARY" as const,
  sortOrder: 0,
  isPrimary: true,
  productId: item.productId,
  altTranslations: {
    hy: item.altHy,
    en: item.altEn,
    ru: item.altRu,
  },
}));

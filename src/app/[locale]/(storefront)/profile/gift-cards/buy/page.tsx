import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Buy flow lives in a drawer on the gift cards list page. */
export default async function BuyGiftCardPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    redirect("/");
  }
  redirect(`/${rawLocale}/profile/gift-cards`);
}

import { notFound } from "next/navigation";

import { getGroupOrderDetailByInvite } from "@/features/group-orders/application/queries";
import { GroupOrderPageClient } from "@/features/group-orders/ui/GroupOrderPageClient";
import { peekGroupOrderSession } from "@/features/group-orders/session";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getSelectedCurrency } from "@/lib/money/display-price";

type PageProps = {
  params: Promise<{ locale: string; inviteToken: string }>;
};

export default async function GroupOrderInvitePage({ params }: PageProps) {
  const { locale: localeRaw, inviteToken } = await params;
  if (!isLocale(localeRaw)) notFound();
  const locale = localeRaw as Locale;

  const dictionary = getDictionary(locale);
  const currency = await getSelectedCurrency();
  const view = await getGroupOrderDetailByInvite({
    inviteToken,
    locale,
    currency,
  });

  if (!view) notFound();

  const session = await peekGroupOrderSession();
  const needsJoin =
    session.inviteToken !== inviteToken || !session.participantId;

  return (
    <GroupOrderPageClient
      locale={locale}
      labels={dictionary.groupOrder}
      initialView={view}
      inviteToken={inviteToken}
      needsJoin={needsJoin}
    />
  );
}

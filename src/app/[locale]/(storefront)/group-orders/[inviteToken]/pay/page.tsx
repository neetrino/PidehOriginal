import { notFound, redirect } from "next/navigation";

import { getParticipantPaymentContext } from "@/features/group-orders/application/participant-payment";
import { GroupOrderPayClient } from "@/features/group-orders/ui/GroupOrderPayClient";
import { peekGroupOrderSession } from "@/features/group-orders/session";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

type PageProps = {
  params: Promise<{ locale: string; inviteToken: string }>;
};

export default async function GroupOrderPayPage({ params }: PageProps) {
  const { locale: localeRaw, inviteToken } = await params;
  if (!isLocale(localeRaw)) notFound();
  const locale = localeRaw as Locale;

  const session = await peekGroupOrderSession();
  if (session.inviteToken !== inviteToken || !session.participantId) {
    redirect(`/${locale}/group-orders/${inviteToken}`);
  }

  const dictionary = getDictionary(locale);
  const context = await getParticipantPaymentContext({
    inviteToken,
    formatAmount: (amount) => formatMoneyAmount(amount, "AMD", locale),
  });

  if (!context.ok) {
    redirect(`/${locale}/group-orders/${inviteToken}`);
  }

  return (
    <GroupOrderPayClient
      locale={locale}
      labels={dictionary.groupOrder}
      inviteToken={inviteToken}
      displayName={context.displayName}
      amountFormatted={context.amountFormatted}
      alreadyPaid={context.alreadyPaid}
      amount={context.amount}
    />
  );
}

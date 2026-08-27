import { notFound, redirect } from "next/navigation";

import { getCustomerBonusSummary } from "@/features/bonuses/application/queries";
import { ProfileStatCard } from "@/features/profile/ui/ProfileStatCard";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";
import { AppLink } from "@/components/ui/AppLink";

type ProfileBonusesPageProps = {
  params: Promise<{ locale: string }>;
};

function typeLabel(
  type: string,
  labels: Record<string, string>,
): string {
  return labels[type] ?? type;
}

export default async function ProfileBonusesPage({
  params,
}: ProfileBonusesPageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${rawLocale}/login`);
  }

  const dictionary = getDictionary(rawLocale);
  const copy = dictionary.profile.bonusesPage;
  const summary = await getCustomerBonusSummary(user.id);

  return (
    <section className="profile-sheet-keep-frame space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {dictionary.profile.bonuses}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ProfileStatCard
          label={copy.available}
          value={summary.availableBalance}
          suffix=" AMD"
        />
        <ProfileStatCard
          label={copy.totalEarned}
          value={summary.totalEarned}
          suffix=" AMD"
        />
        <ProfileStatCard
          label={copy.totalRedeemed}
          value={summary.totalRedeemed}
          suffix=" AMD"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {copy.history}
        </h2>
        {summary.transactions.length === 0 ? (
          <p className="text-sm text-gray-600">{copy.empty}</p>
        ) : (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {summary.transactions.map((row) => {
              const positive = row.delta > 0;
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {typeLabel(row.type, copy.types)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {row.createdAt.toISOString().slice(0, 16).replace("T", " ")}{" "}
                      UTC
                      {row.orderNumber ? (
                        <>
                          {" · "}
                          <AppLink
                            href={`/${rawLocale}/profile/orders`}
                            className="underline-offset-2 hover:underline"
                          >
                            {copy.order} {row.orderNumber}
                          </AppLink>
                        </>
                      ) : null}
                    </p>
                    {row.type === "EARN" ? (
                      <p className="text-xs text-gray-500">
                        {row.expiresAt
                          ? copy.expires.replace(
                              "{date}",
                              row.expiresAt.toISOString().slice(0, 10),
                            )
                          : copy.noExpiry}
                      </p>
                    ) : null}
                  </div>
                  <p
                    className={
                      positive
                        ? "text-sm font-semibold text-emerald-700"
                        : "text-sm font-semibold text-gray-900"
                    }
                  >
                    {positive ? "+" : ""}
                    {formatMoneyAmount(row.delta, "AMD", rawLocale)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

import { notFound } from "next/navigation";

import { getProfileDashboard } from "@/features/profile/application/dashboard-queries";
import { ProfileDashboard } from "@/features/profile/ui/ProfileDashboard";
import { requireUser } from "@/lib/auth/policies";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const user = await requireUser(locale);
  const dictionary = getDictionary(locale);
  const { stats, recentOrders } = await getProfileDashboard(user.id);

  return (
    <ProfileDashboard
      locale={locale}
      firstName={user.firstName}
      dictionary={dictionary.profile}
      stats={stats}
      recentOrders={recentOrders}
    />
  );
}

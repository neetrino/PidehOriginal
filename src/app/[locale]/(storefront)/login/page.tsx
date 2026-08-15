import { Suspense } from "react";
import { notFound } from "next/navigation";

import { LoginForm } from "@/features/auth/ui/LoginForm";
import { LoginScene } from "@/features/auth/ui/LoginScene";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const { auth } = dictionary;

  return (
    <LoginScene
      eyebrow={auth.loginEyebrow}
      neon={auth.loginNeon}
      title={auth.loginTitle}
      subtitle={auth.loginSubtitle}
      windowLabel={auth.loginWindowLabel}
    >
      <Suspense fallback={<p className="text-sm text-white/50">…</p>}>
        <LoginForm locale={rawLocale} dictionary={auth} />
      </Suspense>
    </LoginScene>
  );
}

import { notFound } from "next/navigation";

import { AboutHero } from "@/features/about/ui/AboutHero";
import { AboutStats } from "@/features/about/ui/AboutStats";
import { AboutStory } from "@/features/about/ui/AboutStory";
import { AboutGallery } from "@/features/about/ui/AboutGallery";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);

  return (
    <div className="pideh-about">
      <AboutHero copy={dictionary.about} />
      <AboutStory copy={dictionary.about} />
      <AboutStats copy={dictionary.about} />
      <AboutGallery copy={dictionary.about} />
    </div>
  );
}

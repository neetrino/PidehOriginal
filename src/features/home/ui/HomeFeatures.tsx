import {
  Headphones,
  Package,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type HomeFeaturesProps = {
  title: string;
  items: readonly FeatureItem[];
};

export function HomeFeatures({ title, items }: HomeFeaturesProps) {
  return (
    <section className="border-y border-gray-200 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 md:text-4xl">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-900">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const HOME_FEATURE_ICONS = {
  delivery: Package,
  quality: ShieldCheck,
  return: RotateCcw,
  support: Headphones,
} as const;

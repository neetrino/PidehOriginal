import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";

type CategoryItem = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
};

type HomeCategoriesProps = {
  title: string;
  emptyLabel: string;
  categories: readonly CategoryItem[];
};

export function HomeCategories({
  title,
  emptyLabel,
  categories,
}: HomeCategoriesProps) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
          {title}
        </h2>

        {categories.length === 0 ? (
          <p className="text-gray-600">{emptyLabel}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <AppLink
                key={category.id}
                href={category.href}
                prefetchPolicy="intent"
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100"
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-base font-semibold text-white sm:text-lg">
                  {category.title}
                </span>
              </AppLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

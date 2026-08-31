"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductGalleryImage } from "@/features/products/types";

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  title: string;
  discountPercent?: number | null;
  inStock: boolean;
  outOfStockLabel: string;
};

export function ProductGallery({
  images,
  title,
  discountPercent = null,
  inStock,
  outOfStockLabel,
}: ProductGalleryProps) {
  const [selectedId, setSelectedId] = useState(images[0]?.id ?? null);
  const selected =
    images.find((image) => image.id === selectedId) ?? images[0] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#fff3e0] sm:min-h-[380px] lg:min-h-[500px]">
        {selected ? (
          <Image
            src={selected.url}
            alt={selected.alt || title}
            fill
            sizes="(max-width: 1024px) 100vw, 656px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full min-h-[280px] w-full items-center justify-center text-sm text-[#6b6b6b]">
            —
          </div>
        )}
        {discountPercent != null ? (
          <span className="absolute top-4 left-4 z-10 rounded-[12px] bg-[#ff6b00] px-3 py-1.5 text-sm font-bold text-white">
            −{discountPercent}%
          </span>
        ) : null}
        {!inStock ? (
          <span className="absolute top-4 right-4 z-10 rounded-[12px] bg-[#1e1e1e]/90 px-3 py-1.5 text-sm font-bold text-white">
            {outOfStockLabel}
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2" role="list">
          {images.map((image) => (
            <GalleryThumb
              key={image.id}
              image={image}
              title={title}
              isActive={image.id === selected?.id}
              onSelect={setSelectedId}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GalleryThumb({
  image,
  title,
  isActive,
  onSelect,
}: {
  image: ProductGalleryImage;
  title: string;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(image.id)}
        aria-label={image.alt || title}
        aria-pressed={isActive}
        className={`relative h-16 w-16 overflow-hidden rounded-[12px] bg-[#fff3e0] transition ${
          isActive
            ? "ring-2 ring-white ring-offset-2 ring-offset-[#ff6b00]"
            : "opacity-80 hover:opacity-100"
        }`}
      >
        <Image
          src={image.url}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </button>
    </li>
  );
}

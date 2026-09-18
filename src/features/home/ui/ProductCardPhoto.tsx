'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';
import { useProductImageMotion } from '@/features/home/ui/use-product-image-motion';

type ProductCardPhotoProps = {
  href: string;
  title: string;
  imageUrl: string | null;
  priority: boolean;
};

/**
 * Catalog product photo. Desktop hover lifts the image; layout around it stays still.
 */
export function ProductCardPhoto({
  href,
  title,
  imageUrl,
  priority,
}: ProductCardPhotoProps) {
  const motionHandlers = useProductImageMotion();

  return (
    <div
      ref={motionHandlers.frameRef}
      className="pideh-product-photo-frame relative z-20 h-[180px] w-full shrink-0 overflow-visible"
      onPointerEnter={motionHandlers.onPointerEnter}
      onPointerMove={motionHandlers.onPointerMove}
      onPointerLeave={motionHandlers.onPointerLeave}
      onPointerDown={motionHandlers.onPointerDown}
      onPointerUp={motionHandlers.onPointerUp}
      onPointerCancel={motionHandlers.onPointerCancel}
    >
      <AppLink
        href={href}
        prefetchPolicy={priority ? 'intent' : 'auto'}
        className="absolute inset-0 z-20 block overflow-visible"
      >
        {imageUrl ? (
          <>
            <span aria-hidden className="pideh-product-photo-glow" />
            <motion.span
              className="pideh-product-photo-pose pointer-events-none absolute inset-1 z-[1]"
              style={motionHandlers.poseStyle}
            >
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                priority={priority}
                className="object-contain"
              />
            </motion.span>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
            —
          </div>
        )}
      </AppLink>
    </div>
  );
}

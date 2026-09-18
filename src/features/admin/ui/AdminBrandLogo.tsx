'use client';

import Image from 'next/image';

import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';

type AdminBrandLogoSize = 'sidebar' | 'collapsed' | 'mobile';

type AdminBrandLogoProps = {
  alt: string;
  size: AdminBrandLogoSize;
};

const SIZE_CLASS: Record<AdminBrandLogoSize, string> = {
  sidebar: 'h-10 w-[92px]',
  collapsed: 'h-9 w-10',
  mobile: 'h-9 w-[80px]',
};

export function AdminBrandLogo({ alt, size }: AdminBrandLogoProps) {
  return (
    <span className={`relative block shrink-0 ${SIZE_CLASS[size]}`}>
      <Image
        src={PIDEH_ASSETS.logo}
        alt={alt}
        fill
        sizes="92px"
        className="object-contain object-center"
        priority={size !== 'mobile'}
      />
    </span>
  );
}

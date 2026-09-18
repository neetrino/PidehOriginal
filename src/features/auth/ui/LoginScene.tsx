'use client';

import type { CSSProperties, ReactNode } from 'react';

import { NAV_DOCK_HEIGHT_PX } from '@/components/layout/NavEllipse3469';
import { LoginHeat } from '@/features/auth/ui/LoginHeat';

type LoginSceneProps = {
  title: string;
  children: ReactNode;
  mobileBackgroundSrc?: string;
};

const AUTH_NAV_GAP_PX = 20;

export function LoginScene({ title, children, mobileBackgroundSrc }: LoginSceneProps) {
  const mobileClearance = {
    '--auth-nav-clearance': `${NAV_DOCK_HEIGHT_PX + AUTH_NAV_GAP_PX}px`,
  } as CSSProperties;

  return (
    <div
      className="pideh-login relative z-10 flex min-h-dvh items-end justify-center overflow-x-clip px-5 pt-8 md:items-center md:px-8 md:pt-28 md:pb-16"
      style={mobileClearance}
    >
      <LoginHeat mobileSrc={mobileBackgroundSrc} />
      <div className="relative z-10 w-full min-w-0 max-w-[440px]">
        <div className="overflow-x-clip rounded-[28px] border-2 border-[#1e1e1e] bg-[#fff8e7]/95 p-6 shadow-[6px_6px_0_#1e1e1e] backdrop-blur-sm md:p-8">
          <h1 className="font-display text-4xl leading-[0.95] text-[#1e1e1e] uppercase md:text-5xl">
            {title}
          </h1>
          <div className="mt-8 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

import { LoginHeat } from "@/features/auth/ui/LoginHeat";
import { LoginNeonSign } from "@/features/auth/ui/LoginNeonSign";
import "@/features/auth/ui/login-auth.css";

type LoginSceneProps = {
  eyebrow: string;
  neon: string;
  title: string;
  subtitle: string;
  windowLabel: string;
  children: ReactNode;
};

export function LoginScene({
  eyebrow,
  neon,
  title,
  subtitle,
  windowLabel,
  children,
}: LoginSceneProps) {
  return (
    <div className="pideh-login relative z-10 flex min-h-dvh items-center justify-center px-4 pt-28 pb-16 md:px-8">
      <LoginHeat />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,520px)]">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <p className="text-xs font-bold tracking-[0.28em] text-[#ffd54a] uppercase">
            {eyebrow}
          </p>
          <LoginNeonSign label={neon} />
        </div>
        <div className="login-pass-window rounded-[28px] bg-[#1e1e1e]/70 p-6 backdrop-blur-md md:p-8">
          <p className="mb-3 text-[11px] font-bold tracking-[0.22em] text-[#ff6b00] uppercase">
            {windowLabel}
          </p>
          <h1 className="font-display text-4xl leading-[0.9] text-white uppercase md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 mb-8 text-sm text-white/70">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

import { LoginHeat } from "@/features/auth/ui/LoginHeat";

type LoginSceneProps = {
  title: string;
  children: ReactNode;
};

export function LoginScene({ title, children }: LoginSceneProps) {
  return (
    <div className="pideh-login relative z-10 flex min-h-dvh items-center justify-center px-4 pt-28 pb-16 md:px-8">
      <LoginHeat />
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-[28px] border-2 border-[#1e1e1e] bg-[#fff8e7]/95 p-6 shadow-[6px_6px_0_#1e1e1e] backdrop-blur-sm md:p-8">
          <h1 className="font-display text-4xl leading-[0.95] text-[#1e1e1e] uppercase md:text-5xl">
            {title}
          </h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

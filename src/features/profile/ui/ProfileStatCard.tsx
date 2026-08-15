"use client";

import NumberFlow from "@number-flow/react";

type ProfileStatCardProps = {
  label: string;
  value: number;
  suffix?: string;
};

export function ProfileStatCard({
  label,
  value,
  suffix,
}: ProfileStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[#ff6b00]/15 bg-white p-5 shadow-[0_10px_24px_rgba(30,30,30,0.05)] sm:p-6">
      <span
        className="absolute inset-x-0 top-0 h-1 bg-[#ff6b00]"
        aria-hidden="true"
      />
      <p className="text-[11px] font-bold tracking-[0.16em] text-[#ff6b00] uppercase sm:text-xs">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1e1e1e] sm:mt-3 sm:text-3xl">
        <NumberFlow
          value={value}
          suffix={suffix}
          respectMotionPreference
          transformTiming={{ duration: 700, easing: "ease-out" }}
        />
      </p>
    </div>
  );
}

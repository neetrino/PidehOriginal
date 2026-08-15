"use client";

import NumberFlow from "@number-flow/react";
import Link from "next/link";

import { fadeUp } from "@/components/motion/presets";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type DashboardStatsGridProps = {
  locale: string;
  copy: Dictionary["admin"]["dashboard"]["stats"];
  users: number;
  products: number;
  orders: number;
  revenueAmount: number;
  revenueDelta?: string;
};

function StatCard({
  href,
  label,
  value,
  hint,
  suffix,
  format,
}: {
  href: string;
  label: string;
  value: number;
  hint?: string;
  suffix?: string;
  format?: {
    minimumFractionDigits: number;
    maximumFractionDigits: number;
  };
}) {
  return (
    <Link href={href} className="block h-full">
      <div className="relative h-full overflow-hidden rounded-[22px] border-2 border-[#1e1e1e] bg-white p-5 shadow-[4px_4px_0_#1e1e1e] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1e1e1e]">
        <span
          className="absolute inset-x-0 top-0 h-1.5 bg-[#ff6b00]"
          aria-hidden="true"
        />
        <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#ff6b00] uppercase">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-[#1e1e1e] sm:text-3xl">
          <NumberFlow
            value={value}
            suffix={suffix}
            format={format}
            respectMotionPreference
            transformTiming={{ duration: 700, easing: "ease-out" }}
          />
        </p>
        <p className="mt-1 min-h-4 text-xs text-[#1e1e1e]/55">{hint ?? "\u00a0"}</p>
      </div>
    </Link>
  );
}

export function DashboardStatsGrid({
  locale,
  copy,
  users,
  products,
  orders,
  revenueAmount,
  revenueDelta,
}: DashboardStatsGridProps) {
  const base = `/${locale}/admin`;

  return (
    <StaggerGroup className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StaggerItem variants={fadeUp}>
        <StatCard href={`${base}/users`} label={copy.users} value={users} />
      </StaggerItem>
      <StaggerItem variants={fadeUp}>
        <StatCard
          href={`${base}/products`}
          label={copy.activeProducts}
          value={products}
        />
      </StaggerItem>
      <StaggerItem variants={fadeUp}>
        <StatCard href={`${base}/orders`} label={copy.ordersRange} value={orders} />
      </StaggerItem>
      <StaggerItem variants={fadeUp}>
        <StatCard
          href={`${base}/analytics`}
          label={copy.revenueRange}
          value={revenueAmount}
          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
          hint={revenueDelta}
        />
      </StaggerItem>
    </StaggerGroup>
  );
}

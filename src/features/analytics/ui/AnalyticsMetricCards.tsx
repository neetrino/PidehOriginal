"use client";

import NumberFlow from "@number-flow/react";
import {
  ClipboardList,
  DollarSign,
  Users,
  type LucideIcon,
} from "lucide-react";

import { fadeUp } from "@/components/motion/presets";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type MetricCard = {
  label: string;
  value: number;
  format?: {
    minimumFractionDigits: number;
    maximumFractionDigits: number;
  };
  icon: LucideIcon;
};

type AnalyticsMetricCardsProps = {
  orderCount: number;
  revenueAmount: number;
  userCount: number;
  copy: Dictionary["admin"];
};

export function AnalyticsMetricCards({
  orderCount,
  revenueAmount,
  userCount,
  copy,
}: AnalyticsMetricCardsProps) {
  const metrics: MetricCard[] = [
    {
      label: copy.analytics.metrics.totalOrders,
      value: orderCount,
      icon: ClipboardList,
    },
    {
      label: copy.analytics.metrics.totalRevenue,
      value: revenueAmount,
      format: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      icon: DollarSign,
    },
    {
      label: copy.analytics.metrics.totalUsers,
      value: userCount,
      icon: Users,
    },
  ];

  return (
    <StaggerGroup className="mb-6 grid gap-4 sm:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <StaggerItem key={metric.label} variants={fadeUp}>
            <div className="relative overflow-hidden rounded-[22px] border-2 border-[#1e1e1e] bg-white p-5 shadow-[4px_4px_0_#1e1e1e]">
              <span
                className="absolute inset-x-0 top-0 h-1.5 bg-[#ff6b00]"
                aria-hidden="true"
              />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd54a] text-[#1e1e1e]">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#ff6b00] uppercase">
                {metric.label}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-[#1e1e1e]">
                <NumberFlow
                  value={metric.value}
                  format={metric.format}
                  respectMotionPreference
                  transformTiming={{ duration: 700, easing: "ease-out" }}
                />
              </p>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}

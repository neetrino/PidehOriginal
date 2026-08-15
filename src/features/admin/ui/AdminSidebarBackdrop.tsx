"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";

const SIDEBAR_MESH_COLORS = [
  "#140a04",
  "#ff6b00",
  "#5c1f00",
  "#ffd54a",
  "#1e1e1e",
] as const;

/**
 * Ember mesh + ticket-stripe veil for the admin sidebar (not the login heat).
 */
export function AdminSidebarBackdrop() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <MeshGradient
        className="size-full"
        colors={[...SIDEBAR_MESH_COLORS]}
        speed={reduceMotion ? 0 : 0.16}
        distortion={1.05}
        swirl={0.42}
        grainOverlay={0.28}
      />
      <div className="admin-sidebar-ticket-veil absolute inset-0" />
      <div className="absolute inset-0 bg-[#1e1e1e]/25" />
    </div>
  );
}

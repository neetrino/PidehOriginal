"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";

const LOGIN_MESH_COLORS = ["#1e1e1e", "#ff6b00", "#3a1400", "#ffd54a"] as const;

export function LoginHeat() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <MeshGradient
        className="size-full"
        colors={[...LOGIN_MESH_COLORS]}
        speed={reduceMotion ? 0 : 0.28}
        distortion={0.85}
        swirl={0.22}
        grainOverlay={0.18}
      />
      <div className="absolute inset-0 bg-[#1e1e1e]/35" />
    </div>
  );
}

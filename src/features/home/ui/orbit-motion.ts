import { orbitSlotSpan, type OrbitSlotPose } from '@/features/home/ui/category-orbit-slots';

export const ORBIT_MOVE_DURATION_S = 1.6;

export const ORBIT_MOVE_EASE = [0.22, 1, 0.36, 1] as const;

export const ORBIT_MOVE = {
  duration: ORBIT_MOVE_DURATION_S,
  ease: ORBIT_MOVE_EASE,
} as const;

/** Ignore extra arrow clicks until the slot tween has settled. */
export const ORBIT_MOVE_MS = Math.round(ORBIT_MOVE_DURATION_S * 1000) + 40;

const MAIN_SLOT = 0;

export function poseAreaScale(from: OrbitSlotPose, to: OrbitSlotPose): number {
  return orbitSlotSpan(from) / orbitSlotSpan(to);
}

export function isMainOrbitSlot(poseIndex: number): boolean {
  return poseIndex === MAIN_SLOT;
}

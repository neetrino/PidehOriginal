import { SLOT_COUNT } from '@/features/home/ui/category-orbit-slots';

/** Right-side break in the white ring: top-right (2) is not next to bottom-right (3). */
export const ORBIT_GAP_SLOTS = { topRight: 2, bottomRight: 3 } as const;

const DEST_NEXT = [1, 2, 3, 4, 0] as const;
const DEST_PREV = [4, 0, 1, 2, 3] as const;
const MORPH_FROM_NEXT = ORBIT_GAP_SLOTS.topRight;
const MORPH_FROM_PREV = ORBIT_GAP_SLOTS.bottomRight;

export type OrbitRiderSeat = {
  riderId: number;
  poseIndex: number;
  poolIndex: number;
};

function wrapIndex(value: number, size: number): number {
  if (size <= 0) {
    return 0;
  }
  return ((value % size) + size) % size;
}

function firstUnused(start: number, used: Set<number>, count: number): number {
  for (let offset = 0; offset < count; offset += 1) {
    const candidate = wrapIndex(start + offset, count);
    if (!used.has(candidate)) {
      return candidate;
    }
  }
  return wrapIndex(start, count);
}

function stepRiders(
  riders: readonly OrbitRiderSeat[],
  dest: readonly number[],
  morphFrom: number,
  count: number,
): OrbitRiderSeat[] {
  const moved = riders.map((rider) => ({
    ...rider,
    poseIndex: dest[rider.poseIndex] ?? rider.poseIndex,
  }));

  const used = new Set<number>();
  for (const rider of moved) {
    if (rider.poseIndex !== dest[morphFrom]) {
      used.add(rider.poolIndex);
    }
  }

  const morphing = riders.find((rider) => rider.poseIndex === morphFrom);
  const incoming = firstUnused((morphing?.poolIndex ?? 0) + 1, used, count);

  return moved.map((rider) =>
    rider.riderId === morphing?.riderId ? { ...rider, poolIndex: incoming } : rider,
  );
}

/**
 * Stable riders after `spin` arrow steps. The rider that crosses the right-side
 * gap keeps moving on the ring and swaps to the next catalog photo mid-travel.
 */
export function assignOrbitRiders(spin: number, count: number): OrbitRiderSeat[] {
  if (count <= 0) {
    return [];
  }

  const filled = Math.min(SLOT_COUNT, count);
  let riders: OrbitRiderSeat[] = Array.from({ length: filled }, (_, riderId) => ({
    riderId,
    poseIndex: riderId,
    poolIndex: riderId,
  }));

  if (count < SLOT_COUNT) {
    return riders;
  }

  const forward = spin >= 0;
  const steps = wrapIndex(Math.abs(spin), count);
  const dest = forward ? DEST_NEXT : DEST_PREV;
  const morphFrom = forward ? MORPH_FROM_NEXT : MORPH_FROM_PREV;

  for (let i = 0; i < steps; i += 1) {
    riders = stepRiders(riders, dest, morphFrom, count);
  }

  return riders;
}

export function assignOrbitPoolSlots(spin: number, count: number): number[] {
  const slots = Array.from({ length: SLOT_COUNT }, () => -1);
  for (const rider of assignOrbitRiders(spin, count)) {
    slots[rider.poseIndex] = rider.poolIndex;
  }
  return slots;
}

import { animate, type AnimationPlaybackControls, type MotionValue } from 'motion/react';

import {
  CATEGORY_FRAME,
  ORBIT_CIRCLE,
  nearestEquivalentAngle,
  orbitArcAngleDelta,
  orbitProductVisual,
  orbitSlotSpan,
  type OrbitSlotPose,
} from '@/features/home/ui/category-orbit-slots';
import { isMainOrbitSlot, ORBIT_MOVE, poseAreaScale } from '@/features/home/ui/orbit-motion';

export function orbitFrameXPct(angleDeg: number, radius: number, boxW: number): number {
  const centerX = ORBIT_CIRCLE.cx + radius * Math.cos((angleDeg * Math.PI) / 180);
  return ((centerX - boxW / 2) / CATEGORY_FRAME.w) * 100;
}

export function orbitFrameYPct(angleDeg: number, radius: number, boxH: number): number {
  const centerY = ORBIT_CIRCLE.cy + radius * Math.sin((angleDeg * Math.PI) / 180);
  return ((centerY - boxH / 2) / CATEGORY_FRAME.h) * 100;
}

type OrbitPideValues = {
  angle: MotionValue<number>;
  radius: MotionValue<number>;
  boxW: MotionValue<number>;
  boxH: MotionValue<number>;
  scale: MotionValue<number>;
  zIndex: MotionValue<number>;
  visualRotate: MotionValue<number>;
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  visualScale: MotionValue<number>;
};

export function snapOrbitPideValues(
  values: OrbitPideValues,
  pose: OrbitSlotPose,
  poseIndex: number,
): void {
  const visual = orbitProductVisual(poseIndex);
  const span = orbitSlotSpan(pose);
  values.angle.set(pose.angleDeg);
  values.radius.set(pose.radius);
  values.boxW.set(span);
  values.boxH.set(span);
  values.scale.set(1);
  values.zIndex.set(pose.zIndex);
  values.visualRotate.set(nearestEquivalentAngle(values.visualRotate.get(), visual.rotateDeg));
  values.offsetX.set(visual.offsetXPct);
  values.offsetY.set(visual.offsetYPct);
  values.visualScale.set(visual.scale);
}

export function playOrbitPideTransition(
  values: OrbitPideValues,
  fromPose: OrbitSlotPose,
  fromPoseIndex: number,
  toPose: OrbitSlotPose,
  toPoseIndex: number,
  onComplete: () => void,
): AnimationPlaybackControls[] {
  const fromVisual = orbitProductVisual(fromPoseIndex);
  const toVisual = orbitProductVisual(toPoseIndex);
  const toSpan = orbitSlotSpan(toPose);

  values.boxW.set(toSpan);
  values.boxH.set(toSpan);
  values.angle.set(fromPose.angleDeg);
  values.radius.set(fromPose.radius);
  values.scale.set(poseAreaScale(fromPose, toPose));
  values.offsetX.set(fromVisual.offsetXPct);
  values.offsetY.set(fromVisual.offsetYPct);
  values.visualScale.set(fromVisual.scale);
  values.zIndex.set(isMainOrbitSlot(toPoseIndex) ? toPose.zIndex : fromPose.zIndex);

  const rotateTo = nearestEquivalentAngle(values.visualRotate.get(), toVisual.rotateDeg);

  let finished = false;
  const finish = () => {
    if (finished) {
      return;
    }
    finished = true;
    snapOrbitPideValues(values, toPose, toPoseIndex);
    onComplete();
  };

  const zDelay = isMainOrbitSlot(fromPoseIndex) ? ORBIT_MOVE.duration * 0.5 : 0;

  return [
    animate(values.angle, fromPose.angleDeg + orbitArcAngleDelta(fromPoseIndex, toPoseIndex), {
      ...ORBIT_MOVE,
      onComplete: finish,
    }),
    animate(values.radius, toPose.radius, ORBIT_MOVE),
    animate(values.scale, 1, ORBIT_MOVE),
    animate(values.zIndex, toPose.zIndex, { ...ORBIT_MOVE, delay: zDelay }),
    animate(values.visualRotate, rotateTo, ORBIT_MOVE),
    animate(values.offsetX, toVisual.offsetXPct, ORBIT_MOVE),
    animate(values.offsetY, toVisual.offsetYPct, ORBIT_MOVE),
    animate(values.visualScale, toVisual.scale, ORBIT_MOVE),
  ];
}

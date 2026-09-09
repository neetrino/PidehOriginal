'use client';

import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { AppLink } from '@/components/ui/AppLink';
import { MobileCategoryLayer } from '@/features/home/ui/mobile/MobileCategoryLayer';
import {
  getOrbitNodeStyle,
  mobileArcAngleDelta,
  MOBILE_ARC_SLOTS,
  MOBILE_CENTER_SLOT,
  MOBILE_ORBIT_MOVE_MS,
  MOBILE_SLOT_COUNT,
  ORBIT_CLIP,
  ORBIT_CX,
  ORBIT_CY,
  ORBIT_POSES,
  toCssPx,
  wrapIndex,
  type OrbitPose,
} from '@/features/home/ui/mobile/mobile-orbit-geometry';

export {
  MOBILE_ARC_SLOTS,
  MOBILE_CENTER_SLOT,
  MOBILE_ORBIT_MOVE_MS,
  MOBILE_SLOT_COUNT,
} from '@/features/home/ui/mobile/mobile-orbit-geometry';

type CategoryItem = {
  id: string;
  title: string;
  href: string;
};

export type OrbitCategoryItem = CategoryItem;

type RiderProps = {
  src: string;
  title: string;
  href: string;
  nodeId: string;
  pose: OrbitPose;
  poseIndex: number;
  isCenter: boolean;
  reduceMotion: boolean | null;
};

function applyRiderPosition(element: HTMLDivElement, left: number, top: number): void {
  element.style.left = toCssPx(left);
  element.style.top = toCssPx(top);
}

/**
 * Renders a deterministic rest pose for SSR/hydration, then animates left/top
 * imperatively after mount (Motion values never enter the React style object).
 */
function OrbitRider({
  src,
  title,
  href,
  nodeId,
  pose,
  poseIndex,
  isCenter,
  reduceMotion,
}: RiderProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const settledPoseIndexRef = useRef(poseIndex);
  const angle = useMotionValue(pose.angleDeg);
  const radius = useMotionValue(pose.radius);
  const boxW = useMotionValue(pose.frameW);
  const boxH = useMotionValue(pose.frameH);

  const nodeStyle = useMemo(() => getOrbitNodeStyle(pose, isCenter), [isCenter, pose]);

  useEffect(() => {
    const snap = (target: OrbitPose, targetIndex: number) => {
      settledPoseIndexRef.current = targetIndex;
      angle.set(target.angleDeg);
      radius.set(target.radius);
      boxW.set(target.frameW);
      boxH.set(target.frameH);
    };

    if (reduceMotion) {
      snap(pose, poseIndex);
      return;
    }

    const fromPoseIndex = settledPoseIndexRef.current;
    if (fromPoseIndex === poseIndex) {
      snap(pose, poseIndex);
      return;
    }

    const fromPose = ORBIT_POSES[fromPoseIndex];
    if (!fromPose) {
      snap(pose, poseIndex);
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) {
        return;
      }
      finished = true;
      snap(pose, poseIndex);
    };

    angle.set(fromPose.angleDeg);
    radius.set(fromPose.radius);
    boxW.set(pose.frameW);
    boxH.set(pose.frameH);

    const arcDelta = mobileArcAngleDelta(fromPoseIndex, poseIndex);
    const move = {
      duration: MOBILE_ORBIT_MOVE_MS / 1000,
      ease: [0.22, 1, 0.36, 1] as const,
    };
    const controls = [
      animate(angle, fromPose.angleDeg + arcDelta, {
        ...move,
        onComplete: finish,
      }),
      animate(radius, pose.radius, move),
    ];

    return () => {
      for (const control of controls) {
        control.stop();
      }
      finish();
    };
  }, [angle, boxH, boxW, pose, poseIndex, radius, reduceMotion]);

  const left = useTransform([angle, radius, boxW], (values) => {
    const [angleDeg, radiusPx, widthPx] = values as [number, number, number];
    const rad = (angleDeg * Math.PI) / 180;
    return ORBIT_CX + radiusPx * Math.cos(rad) - widthPx / 2;
  });

  const top = useTransform([angle, radius, boxH], (values) => {
    const [angleDeg, radiusPx, heightPx] = values as [number, number, number];
    const rad = (angleDeg * Math.PI) / 180;
    return ORBIT_CY + radiusPx * Math.sin(rad) - heightPx / 2;
  });

  // Before paint on pose change: keep the previous motion position so React's
  // target-pose style commit does not flash the end state for one frame.
  useLayoutEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }
    applyRiderPosition(element, left.get(), top.get());
  }, [left, poseIndex, top]);

  useMotionValueEvent(left, 'change', (value) => {
    const element = nodeRef.current;
    if (element) {
      applyRiderPosition(element, value, top.get());
    }
  });
  useMotionValueEvent(top, 'change', (value) => {
    const element = nodeRef.current;
    if (element) {
      applyRiderPosition(element, left.get(), value);
    }
  });

  return (
    <div ref={nodeRef} className="absolute will-change-transform" style={nodeStyle}>
      <AppLink
        href={href}
        prefetchPolicy="intent"
        aria-current={isCenter ? 'true' : undefined}
        data-node-id={nodeId}
        className="pointer-events-auto absolute inset-0 flex items-center justify-center"
      >
        <MobileCategoryLayer
          src={src}
          alt={title}
          width={pose.frameW}
          height={pose.frameH}
          iconWidth={pose.iconW}
          iconHeight={pose.iconH}
          rotateDeg={pose.leafRotate}
        />
      </AppLink>
    </div>
  );
}

type MobileCategoryOrbitProps = {
  spin: number;
  productsHref: string;
  categories: readonly OrbitCategoryItem[];
};

/**
 * Category icons at Figma rest poses; arrow spin rides the drip ellipse.
 * Edge wrap travels through the clipped (invisible) upper arc.
 */
export function MobileCategoryOrbit({ spin, productsHref, categories }: MobileCategoryOrbitProps) {
  const reduceMotion = useReducedMotion();

  const riders = useMemo(() => {
    return MOBILE_ARC_SLOTS.map((home, riderIndex) => {
      const poseIndex = wrapIndex(riderIndex - spin, MOBILE_SLOT_COUNT);
      const pose = ORBIT_POSES[poseIndex] ?? ORBIT_POSES[MOBILE_CENTER_SLOT]!;
      const category = categories[riderIndex];

      return {
        key: `mobile-orbit-${riderIndex}`,
        poseIndex,
        pose,
        src: home.src,
        nodeId: home.nodeId,
        href: category?.href ?? productsHref,
        title: category?.title ?? '',
        isCenter: poseIndex === MOBILE_CENTER_SLOT,
      };
    });
  }, [categories, productsHref, spin]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30" style={{ clipPath: ORBIT_CLIP }}>
      {riders.map((rider) => (
        <OrbitRider
          key={rider.key}
          src={rider.src}
          title={rider.title}
          href={rider.href}
          nodeId={rider.nodeId}
          pose={rider.pose}
          poseIndex={rider.poseIndex}
          isCenter={rider.isCenter}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

/** Title of the category currently sitting in the yellow center disc. */
export function mobileActiveCategoryTitle(
  spin: number,
  categories: readonly OrbitCategoryItem[],
): string {
  if (categories.length === 0) {
    return '';
  }
  const riderIndex = wrapIndex(MOBILE_CENTER_SLOT + spin, categories.length);
  return categories[riderIndex]?.title ?? '';
}

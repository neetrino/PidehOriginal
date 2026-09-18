'use client';

import {
  animate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from 'motion/react';
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  ENTER_SPRING,
  EXIT_SPRING,
  FINE_POINTER_QUERY,
  HOVER_LIFT_Y,
  HOVER_ROTATE_Z,
  HOVER_SCALE,
  MAGNET_SPRING,
  TOUCH_PRESS_SCALE,
  magnetFromPointer,
} from '@/features/home/ui/product-image-motion';

type Playback = { stop: () => void };

export type ProductImageMotionHandlers = {
  frameRef: React.RefObject<HTMLDivElement | null>;
  poseStyle: MotionStyle;
  onPointerEnter: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
};

function isFinePointerDevice(): boolean {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function isMagneticPointer(event: ReactPointerEvent<HTMLDivElement>): boolean {
  return (
    isFinePointerDevice() &&
    (event.pointerType === 'mouse' || event.pointerType === 'pen')
  );
}

function stopPlayback(playback: Playback[]): void {
  for (const item of playback) {
    item.stop();
  }
  playback.length = 0;
}

function setPhotoLifted(frame: HTMLDivElement | null, lifted: boolean): void {
  if (!frame) return;
  if (lifted) {
    frame.setAttribute('data-lifted', 'true');
    return;
  }
  frame.removeAttribute('data-lifted');
}

function usePhotoLiftMotion() {
  const liftY = useMotionValue(0);
  const scale = useMotionValue(1);
  const restRotateZ = useMotionValue(0);
  const playbackRef = useRef<Playback[]>([]);

  const playEnter = useCallback(() => {
    stopPlayback(playbackRef.current);
    playbackRef.current = [
      animate(liftY, HOVER_LIFT_Y, ENTER_SPRING),
      animate(scale, HOVER_SCALE, ENTER_SPRING),
      animate(restRotateZ, HOVER_ROTATE_Z, ENTER_SPRING),
    ];
  }, [liftY, restRotateZ, scale]);

  const playExit = useCallback(
    (resetMagnet: () => void) => {
      stopPlayback(playbackRef.current);
      resetMagnet();
      playbackRef.current = [
        animate(liftY, 0, EXIT_SPRING),
        animate(scale, 1, EXIT_SPRING),
        animate(restRotateZ, 0, EXIT_SPRING),
      ];
    },
    [liftY, restRotateZ, scale],
  );

  return { liftY, scale, restRotateZ, playbackRef, playEnter, playExit };
}

function usePhotoMagnetMotion(
  liftY: MotionValue<number>,
  restRotateZ: MotionValue<number>,
) {
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);
  const magnetRotateZ = useMotionValue(0);
  const magnetRotateX = useMotionValue(0);
  const magnetRotateY = useMotionValue(0);
  const x = useSpring(magnetX, MAGNET_SPRING);
  const magnetYSpring = useSpring(magnetY, MAGNET_SPRING);
  const rotateX = useSpring(magnetRotateX, MAGNET_SPRING);
  const rotateY = useSpring(magnetRotateY, MAGNET_SPRING);
  const magnetRotateZSpring = useSpring(magnetRotateZ, MAGNET_SPRING);
  const hoveringRef = useRef(false);
  const rafRef = useRef(0);
  const pendingRef = useRef({ x: 0, y: 0 });

  const y = useTransform([liftY, magnetYSpring], (values) => {
    const [lift, magnet] = values as [number, number];
    return lift + magnet;
  });
  const rotateZ = useTransform([restRotateZ, magnetRotateZSpring], (values) => {
    const [rest, magnet] = values as [number, number];
    return rest + magnet;
  });

  const resetMagnet = useCallback(() => {
    magnetX.set(0);
    magnetY.set(0);
    magnetRotateZ.set(0);
    magnetRotateX.set(0);
    magnetRotateY.set(0);
  }, [magnetRotateX, magnetRotateY, magnetRotateZ, magnetX, magnetY]);

  const flushMagnet = useCallback(() => {
    rafRef.current = 0;
    if (!hoveringRef.current) return;
    const magnet = magnetFromPointer(pendingRef.current.x, pendingRef.current.y);
    magnetX.set(magnet.x);
    magnetY.set(magnet.y);
    magnetRotateZ.set(magnet.rotateZ);
    magnetRotateX.set(magnet.rotateX);
    magnetRotateY.set(magnet.rotateY);
  }, [magnetRotateX, magnetRotateY, magnetRotateZ, magnetX, magnetY]);

  return {
    x,
    y,
    rotateX,
    rotateY,
    rotateZ,
    hoveringRef,
    rafRef,
    pendingRef,
    resetMagnet,
    flushMagnet,
  };
}

/**
 * Pointer-driven product photo lift. Updates motion values only — no React
 * re-render on mousemove.
 */
export function useProductImageMotion(): ProductImageMotionHandlers {
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const lift = usePhotoLiftMotion();
  const magnet = usePhotoMagnetMotion(lift.liftY, lift.restRotateZ);

  const onPointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reduceMotion) {
        setPhotoLifted(frameRef.current, true);
        return;
      }
      if (!isMagneticPointer(event)) return;
      magnet.hoveringRef.current = true;
      setPhotoLifted(frameRef.current, true);
      lift.playEnter();
    },
    [lift, magnet.hoveringRef, reduceMotion],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reduceMotion || !magnet.hoveringRef.current || !isMagneticPointer(event)) {
        return;
      }
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      magnet.pendingRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
      };
      if (magnet.rafRef.current !== 0) return;
      magnet.rafRef.current = window.requestAnimationFrame(magnet.flushMagnet);
    },
    [magnet, reduceMotion],
  );

  const onPointerLeave = useCallback(() => {
    magnet.hoveringRef.current = false;
    if (magnet.rafRef.current !== 0) {
      window.cancelAnimationFrame(magnet.rafRef.current);
      magnet.rafRef.current = 0;
    }
    setPhotoLifted(frameRef.current, false);
    if (reduceMotion) return;
    lift.playExit(magnet.resetMagnet);
  }, [lift, magnet, reduceMotion]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reduceMotion || event.pointerType !== 'touch') return;
      stopPlayback(lift.playbackRef.current);
      lift.playbackRef.current = [
        animate(lift.scale, TOUCH_PRESS_SCALE, { duration: 0.12 }),
      ];
    },
    [lift.playbackRef, lift.scale, reduceMotion],
  );

  const releaseTouch = useCallback(() => {
    if (reduceMotion || magnet.hoveringRef.current) return;
    stopPlayback(lift.playbackRef.current);
    lift.playbackRef.current = [animate(lift.scale, 1, EXIT_SPRING)];
  }, [lift.playbackRef, lift.scale, magnet.hoveringRef, reduceMotion]);

  useEffect(() => {
    const hovering = magnet.hoveringRef;
    const raf = magnet.rafRef;
    const playback = lift.playbackRef;
    return () => {
      hovering.current = false;
      if (raf.current !== 0) {
        window.cancelAnimationFrame(raf.current);
      }
      stopPlayback(playback.current);
    };
  }, [lift.playbackRef, magnet.hoveringRef, magnet.rafRef]);

  return {
    frameRef,
    poseStyle: {
      x: magnet.x,
      y: magnet.y,
      scale: lift.scale,
      rotateX: magnet.rotateX,
      rotateY: magnet.rotateY,
      rotateZ: magnet.rotateZ,
      transformPerspective: 720,
      transformStyle: 'preserve-3d',
    },
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onPointerUp: releaseTouch,
    onPointerCancel: releaseTouch,
  };
}

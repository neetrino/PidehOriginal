'use client';

import {
  useCallback,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  resolveOrbitSwipeDelta,
  type OrbitSwipeStep,
} from '@/features/home/ui/mobile/orbit-swipe';

type PointerSession = {
  pointerId: number;
  startX: number;
  startY: number;
};

export type OrbitSwipeHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
};

type UseOrbitSwipeResult = {
  handlers: OrbitSwipeHandlers;
};

/**
 * One-step orbit swipe. Suppresses the following click so category icons
 * do not navigate when the gesture was a drag.
 */
export function useOrbitSwipe(onStep: (delta: OrbitSwipeStep) => void): UseOrbitSwipeResult {
  const sessionRef = useRef<PointerSession | null>(null);
  const suppressClickRef = useRef(false);

  const clearSession = useCallback(() => {
    sessionRef.current = null;
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    suppressClickRef.current = false;
    sessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const session = sessionRef.current;
      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      const delta = resolveOrbitSwipeDelta(
        event.clientX - session.startX,
        event.clientY - session.startY,
      );
      if (delta === 0) {
        return;
      }

      suppressClickRef.current = true;
      sessionRef.current = null;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      onStep(delta);
    },
    [onStep],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (sessionRef.current?.pointerId === event.pointerId) {
        clearSession();
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (suppressClickRef.current) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
    },
    [clearSession],
  );

  const onClickCapture = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }, []);

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClickCapture,
    },
  };
}

'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

import { ContactMapControls } from '@/features/contact/ui/ContactMapControls';

type ContactMapZoomProps = {
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomEnableLabel: string;
  zoomDisableLabel: string;
};

const WHEEL_LISTENER: AddEventListenerOptions = { passive: false, capture: true };

/**
 * Click the map to allow zoom. Click again or press Escape to lock it.
 */
export function ContactMapZoom({
  zoomInLabel,
  zoomOutLabel,
  zoomEnableLabel,
  zoomDisableLabel,
}: ContactMapZoomProps) {
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <MapZoomLock enabled={enabled} onEnabledChange={setEnabled} />
      <EnableMapPointerZoom enabled={enabled} />
      <MapZoomHint
        enabled={enabled}
        enableLabel={zoomEnableLabel}
        disableLabel={zoomDisableLabel}
      />
      {enabled ? (
        <ContactMapControls zoomInLabel={zoomInLabel} zoomOutLabel={zoomOutLabel} />
      ) : null}
    </>
  );
}

function MapZoomLock({
  enabled,
  onEnabledChange,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.getContainer().classList.toggle('is-zoom-enabled', enabled);
  }, [enabled, map]);

  useEffect(() => {
    const onMapClick = () => {
      onEnabledChange(!enabled);
    };
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [enabled, map, onEnabledChange]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      onEnabledChange(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onEnabledChange]);

  return null;
}

function MapZoomHint({
  enabled,
  enableLabel,
  disableLabel,
}: {
  enabled: boolean;
  enableLabel: string;
  disableLabel: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-[1080] flex justify-center px-4 ${
        enabled ? 'top-4' : 'bottom-4'
      }`}
    >
      <p className="rounded-full bg-white/92 px-4 py-2 text-center text-sm font-bold text-[#ff6b00] shadow-[0px_8px_14px_rgba(31,20,8,0.11)]">
        {enabled ? disableLabel : enableLabel}
      </p>
    </div>
  );
}

function gestureScale(event: Event): number {
  if ('scale' in event && typeof event.scale === 'number') {
    return event.scale;
  }
  return 1;
}

/** Native Leaflet zoom (scale tiles, then swap). Avoid per-frame setZoom — that blanks the map. */
function EnableMapPointerZoom({ enabled }: { enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (enabled) {
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      return;
    }
    map.scrollWheelZoom.disable();
    map.touchZoom.disable();
  }, [enabled, map]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const container = map.getContainer();
    let pinchStartZoom = map.getZoom();

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
    };

    const onGestureStart = (event: Event) => {
      event.preventDefault();
      pinchStartZoom = map.getZoom();
    };

    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const nextZoom = Math.round(pinchStartZoom + Math.log2(gestureScale(event)));
      if (nextZoom !== map.getZoom()) {
        map.setZoom(nextZoom, { animate: true });
      }
    };

    container.addEventListener('wheel', onWheel, WHEEL_LISTENER);
    container.addEventListener('gesturestart', onGestureStart, WHEEL_LISTENER);
    container.addEventListener('gesturechange', onGestureChange, WHEEL_LISTENER);

    return () => {
      container.removeEventListener('wheel', onWheel, WHEEL_LISTENER);
      container.removeEventListener('gesturestart', onGestureStart, WHEEL_LISTENER);
      container.removeEventListener('gesturechange', onGestureChange, WHEEL_LISTENER);
    };
  }, [enabled, map]);

  return null;
}

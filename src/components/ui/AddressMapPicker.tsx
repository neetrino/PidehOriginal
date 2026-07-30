"use client";

import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { createPortal } from "react-dom";

import { getMapPickerConfigAction } from "@/features/delivery/application/get-map-picker-config";
import { reverseGeocodeAddressAction } from "@/features/delivery/application/reverse-geocode-address";
import {
  loadGoogleMapsScript,
  type GoogleMapInstance,
  type GoogleMarkerInstance,
  type GoogleMapsNamespace,
} from "@/lib/maps/load-google-maps-script";

type AddressMapPickerLabels = {
  openMap: string;
  title: string;
  hint: string;
  confirm: string;
  cancel: string;
  resolving: string;
};

type AddressMapPickerProps = {
  addressValue: string;
  disabled?: boolean;
  labels: AddressMapPickerLabels;
  onAddressSelected: (address: string) => void;
};

type PickedPoint = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

/**
 * Opens a Google Map modal so the customer can drop a pin for delivery.
 */
export function AddressMapPicker({
  addressValue,
  disabled = false,
  labels,
  onAddressSelected,
}: AddressMapPickerProps) {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedPoint | null>(null);

  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleMarkerInstance | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !resolving) {
        setExiting(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, resolving]);

  useEffect(() => {
    if (!open || exiting) return;

    const cancelled = { current: false };
    mapRef.current = null;
    markerRef.current = null;

    void (async () => {
      setLoading(true);
      setError(null);
      setPicked(null);

      const config = await getMapPickerConfigAction(addressValue);
      if (cancelled.current) return;
      if (!config.ok) {
        setLoading(false);
        setError(config.error);
        return;
      }

      try {
        const maps = await loadGoogleMapsScript(config.apiKey);
        if (cancelled.current || !mapElementRef.current) return;

        const map = new maps.Map(mapElementRef.current, {
          center: config.center,
          zoom: config.zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;

        const marker = new maps.Marker({
          map,
          position: config.center,
          draggable: true,
        });
        markerRef.current = marker;

        function onUpdate(next: ResolveUpdate): void {
          if (cancelled.current) return;
          setResolving(next.resolving);
          if (next.error) setError(next.error);
          if (next.picked) {
            setError(null);
            setPicked(next.picked);
          }
        }

        bindMapSelection(maps, map, marker, cancelled, onUpdate);
        await resolveMapPoint(
          config.center.lat,
          config.center.lng,
          cancelled,
          onUpdate,
        );
        if (!cancelled.current) setLoading(false);
      } catch (loadError) {
        if (cancelled.current) return;
        setLoading(false);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Google Maps failed to load.",
        );
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [open, exiting, addressValue]);

  function closePicker(): void {
    if (resolving) return;
    setExiting(true);
  }

  function handlePanelAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) return;
    if (!exiting) return;
    if (!event.animationName.includes("confirm-dialog-panel-out")) return;
    setOpen(false);
    setExiting(false);
  }

  function onConfirm(): void {
    if (!picked || resolving) return;
    onAddressSelected(picked.formattedAddress);
    setExiting(true);
  }

  const backdropClass = exiting
    ? "animate-confirm-dialog-backdrop-out"
    : "animate-confirm-dialog-backdrop-in";
  const panelClass = exiting
    ? "animate-confirm-dialog-panel-out"
    : "animate-confirm-dialog-panel-in";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setExiting(false);
          setOpen(true);
        }}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={labels.openMap}
      >
        <MapPin className="h-4 w-4 text-gray-700" aria-hidden />
        <span className="hidden sm:inline">{labels.openMap}</span>
      </button>

      {typeof document !== "undefined" && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="address-map-picker-title"
            >
              <button
                type="button"
                className={`absolute inset-0 cursor-pointer bg-black/40 ${backdropClass}`}
                aria-label={labels.cancel}
                disabled={resolving}
                onClick={closePicker}
              />
              <div
                className={`relative z-[1] flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl ${panelClass}`}
                onAnimationEnd={handlePanelAnimationEnd}
              >
                <MapPickerHeader labels={labels} onClose={closePicker} resolving={resolving} />
                <div className="relative min-h-[320px] flex-1 bg-gray-100 sm:min-h-[420px]">
                  <div ref={mapElementRef} className="absolute inset-0" />
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-gray-600">
                      …
                    </div>
                  ) : null}
                </div>
                <MapPickerFooter
                  labels={labels}
                  error={error}
                  resolving={resolving}
                  address={picked?.formattedAddress ?? ""}
                  canConfirm={Boolean(picked) && !resolving}
                  onCancel={closePicker}
                  onConfirm={onConfirm}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

type ResolveUpdate = {
  resolving: boolean;
  error?: string;
  picked?: PickedPoint;
};

async function resolveMapPoint(
  lat: number,
  lng: number,
  cancelled: { current: boolean },
  onUpdate: (update: ResolveUpdate) => void,
): Promise<void> {
  onUpdate({ resolving: true });
  const result = await reverseGeocodeAddressAction({ lat, lng });
  if (cancelled.current) return;
  if (!result.ok) {
    onUpdate({ resolving: false, error: result.error });
    return;
  }
  onUpdate({
    resolving: false,
    picked: {
      lat: result.lat,
      lng: result.lng,
      formattedAddress: result.formattedAddress,
    },
  });
}

function bindMapSelection(
  maps: GoogleMapsNamespace,
  map: GoogleMapInstance,
  marker: GoogleMarkerInstance,
  cancelled: { current: boolean },
  onUpdate: (update: ResolveUpdate) => void,
): void {
  maps.event.addListener(map, "click", (event) => {
    const latLng = event.latLng;
    if (!latLng) return;
    const lat = latLng.lat();
    const lng = latLng.lng();
    marker.setPosition({ lat, lng });
    void resolveMapPoint(lat, lng, cancelled, onUpdate);
  });

  maps.event.addListener(marker, "dragend", () => {
    const position = marker.getPosition();
    if (!position) return;
    void resolveMapPoint(position.lat(), position.lng(), cancelled, onUpdate);
  });
}

function MapPickerHeader({
  labels,
  onClose,
  resolving,
}: {
  labels: AddressMapPickerLabels;
  onClose: () => void;
  resolving: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <div>
        <h2
          id="address-map-picker-title"
          className="text-lg font-semibold text-gray-900"
        >
          {labels.title}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{labels.hint}</p>
      </div>
      <button
        type="button"
        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        aria-label={labels.cancel}
        disabled={resolving}
        onClick={onClose}
      >
        <X className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}

function MapPickerFooter({
  labels,
  error,
  resolving,
  address,
  canConfirm,
  onCancel,
  onConfirm,
}: {
  labels: AddressMapPickerLabels;
  error: string | null;
  resolving: boolean;
  address: string;
  canConfirm: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-3 border-t border-gray-100 px-5 py-4">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="min-h-5 text-sm text-gray-700">
        {resolving ? labels.resolving : address}
      </p>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          disabled={resolving}
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          {labels.cancel}
        </button>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={onConfirm}
          className="inline-flex h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {labels.confirm}
        </button>
      </div>
    </div>
  );
}

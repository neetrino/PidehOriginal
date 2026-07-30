"use client";

type GoogleMapsNamespace = {
  Map: new (
    element: HTMLElement,
    options: {
      center: { lat: number; lng: number };
      zoom: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    },
  ) => GoogleMapInstance;
  Marker: new (options: {
    map: GoogleMapInstance;
    position: { lat: number; lng: number };
    draggable?: boolean;
  }) => GoogleMarkerInstance;
  event: {
    addListener: (
      instance: GoogleMapInstance | GoogleMarkerInstance,
      eventName: string,
      handler: (event: { latLng?: { lat: () => number; lng: () => number } | null }) => void,
    ) => void;
  };
};

type GoogleMapInstance = {
  setCenter: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
};

type GoogleMarkerInstance = {
  setPosition: (position: { lat: number; lng: number }) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
};

declare global {
  interface Window {
    google?: { maps?: GoogleMapsNamespace };
    __kamanchaMapsReady?: () => void;
  }
}

const SCRIPT_ID = "kamancha-google-maps-js";

/** Loads Google Maps JavaScript API once per page. */
export function loadGoogleMapsScript(apiKey: string): Promise<GoogleMapsNamespace> {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const timer = window.setInterval(() => {
        if (window.google?.maps) {
          window.clearInterval(timer);
          resolve(window.google.maps);
          return;
        }
        if (Date.now() - started > 15000) {
          window.clearInterval(timer);
          reject(new Error("Google Maps failed to load."));
        }
      }, 50);
    });
  }

  return new Promise((resolve, reject) => {
    window.__kamanchaMapsReady = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }
      reject(new Error("Google Maps failed to initialize."));
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=__kamanchaMapsReady`;
    script.onerror = () => {
      reject(
        new Error(
          "Google Maps failed to load. Check that Maps JavaScript API is enabled and allowed by Content-Security-Policy.",
        ),
      );
    };
    document.head.appendChild(script);
  });
}

export type { GoogleMapsNamespace, GoogleMapInstance, GoogleMarkerInstance };

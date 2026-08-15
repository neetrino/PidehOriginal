"use client";

import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import {
  CONTACT_BRANCHES,
  type ContactBranchId,
} from "@/features/contact/ui/contact-locations";
import {
  ContactMapControls,
  FlyToActiveBranch,
} from "@/features/contact/ui/ContactMapControls";

import "leaflet/dist/leaflet.css";
import "@/features/contact/ui/contact-map.css";

type ContactMapCanvasProps = {
  primaryLabel: string;
  secondaryLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  activeBranchId: ContactBranchId | null;
};

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const BRANCH_LABEL_KEY: Record<ContactBranchId, "primary" | "secondary"> = {
  andranik: "primary",
  koghbatsi: "secondary",
};

const pinIcon = L.divIcon({
  className: "contact-map-pin",
  html: '<span class="contact-map-pin-mark"><span class="contact-map-pin-pulse"></span><span class="contact-map-pin-head"></span><span class="contact-map-pin-stem"></span></span>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -28],
});

function FitBranches({ points }: { points: LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [72, 72], maxZoom: 14 });
  }, [map, points]);

  return null;
}

export function ContactMapCanvas({
  primaryLabel,
  secondaryLabel,
  zoomInLabel,
  zoomOutLabel,
  activeBranchId,
}: ContactMapCanvasProps) {
  const labels = { primary: primaryLabel, secondary: secondaryLabel };
  const origin = CONTACT_BRANCHES[0] ?? { lat: 40.1792, lng: 44.4991 };
  const points = useMemo<LatLngExpression[]>(
    () => CONTACT_BRANCHES.map((branch) => [branch.lat, branch.lng]),
    [],
  );

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={13}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-[min(70vh,540px)] w-full"
    >
      <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
      <FitBranches points={points} />
      <FlyToActiveBranch branchId={activeBranchId} />
      <ContactMapControls
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
      {CONTACT_BRANCHES.map((branch) => (
        <Marker
          key={branch.id}
          position={[branch.lat, branch.lng]}
          icon={pinIcon}
        >
          <Popup>{labels[BRANCH_LABEL_KEY[branch.id]]}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

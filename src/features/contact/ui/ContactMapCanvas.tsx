'use client';

import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { CONTACT_BRANCHES, type ContactBranchId } from '@/features/contact/ui/contact-locations';
import { FlyToActiveBranch } from '@/features/contact/ui/ContactMapControls';
import { ContactMapZoom } from '@/features/contact/ui/ContactMapZoom';

import 'leaflet/dist/leaflet.css';
import '@/features/contact/ui/contact-map.css';

type ContactMapCanvasProps = {
  primaryLabel: string;
  secondaryLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomEnableLabel: string;
  zoomDisableLabel: string;
  activeBranchId: ContactBranchId | null;
};

/** CARTO voyager now watermarks tiles without an API key. OSM stays readable without one. */
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const BRANCH_LABEL_KEY: Record<ContactBranchId, 'primary' | 'secondary'> = {
  andranik: 'primary',
  koghbatsi: 'secondary',
};

const pinIcon = L.divIcon({
  className: 'contact-map-pin',
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
  zoomEnableLabel,
  zoomDisableLabel,
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
      minZoom={8}
      maxZoom={19}
      zoomSnap={1}
      zoomDelta={1}
      zoomAnimation
      fadeAnimation={false}
      markerZoomAnimation
      wheelPxPerZoomLevel={140}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      dragging
      zoomControl={false}
      className="h-[min(70vh,540px)] w-full"
    >
      <TileLayer
        attribution={TILE_ATTR}
        url={TILE_URL}
        maxZoom={19}
        keepBuffer={8}
        updateWhenZooming={false}
      />
      <FitBranches points={points} />
      <FlyToActiveBranch branchId={activeBranchId} />
      <ContactMapZoom
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
        zoomEnableLabel={zoomEnableLabel}
        zoomDisableLabel={zoomDisableLabel}
      />
      {CONTACT_BRANCHES.map((branch) => (
        <Marker key={branch.id} position={[branch.lat, branch.lng]} icon={pinIcon}>
          <Popup>{labels[BRANCH_LABEL_KEY[branch.id]]}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

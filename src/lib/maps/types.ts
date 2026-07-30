export type PlaceAutocompleteSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string | null;
  fullText: string;
};

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type GeocodeResult = {
  formattedAddress: string;
  location: GeoPoint;
  city: string | null;
  countryCode: string | null;
};

export type DrivingDistanceResult = {
  distanceMeters: number;
  durationSeconds: number;
};

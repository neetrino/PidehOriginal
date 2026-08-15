export type ContactBranchId = "andranik" | "koghbatsi";

export type ContactBranchPoint = {
  id: ContactBranchId;
  lat: number;
  lng: number;
};

/** Approximate storefront coordinates in Yerevan. */
export const CONTACT_BRANCHES: readonly ContactBranchPoint[] = [
  { id: "andranik", lat: 40.1579, lng: 44.5052 },
  { id: "koghbatsi", lat: 40.1776, lng: 44.5091 },
];

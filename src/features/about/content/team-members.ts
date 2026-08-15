import { pidehRasterUrl } from "@/lib/media/r2-public-asset-url";

export const ABOUT_HERO_IMAGE = pidehRasterUrl("about-hero");

export const ABOUT_GALLERY = [
  { id: "stall", src: pidehRasterUrl("about-slide-stall") },
  { id: "pide", src: pidehRasterUrl("about-slide-pide") },
  { id: "kitchen", src: pidehRasterUrl("about-slide-kitchen") },
  { id: "terrace", src: pidehRasterUrl("about-slide-terrace") },
  { id: "spread", src: pidehRasterUrl("about-slide-spread") },
] as const;

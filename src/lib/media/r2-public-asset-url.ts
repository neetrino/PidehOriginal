/**
 * Client-safe public URL for objects on the R2 CDN.
 * `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` is inlined from `R2_PUBLIC_BASE_URL` in next.config.
 */
export function r2PublicAssetUrl(objectKey: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  const key = objectKey.replace(/^\//, "");
  if (!base) {
    return `/${key}`;
  }
  return `${base}/${key}`;
}

/** Raster brand files stored on R2 as WebP. SVGs stay in `public/`. */
export function pidehRasterUrl(fileStem: string): string {
  return r2PublicAssetUrl(`brand/pideh/${fileStem}.webp`);
}

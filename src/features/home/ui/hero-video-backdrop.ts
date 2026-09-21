/** Decoded Kling MP4 backdrop (PNG still #FF852B does not match the video). */
export const HERO_VIDEO_BG = '#FC8521';

export const HERO_VIDEO_BG_VAR = '--pideh-hero-video-bg';

const SAMPLE_INSET_RATIO = 0.02;
const MIN_ORANGE_RED = 180;
const MIN_CHANNEL_SUM = 80;

/**
 * Averages top-edge orange pixels from the playing hero video so the page
 * backdrop matches the browser-decoded frame (YUV ≠ the PNG still).
 */
export function sampleVideoTopBackdrop(video: HTMLVideoElement): string | null {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (width < 8 || height < 8) {
    return null;
  }

  const context = createSampleContext();
  if (!context) {
    return null;
  }

  const insetX = Math.max(4, Math.round(width * SAMPLE_INSET_RATIO));
  const insetY = Math.max(4, Math.round(height * SAMPLE_INSET_RATIO));
  const points: ReadonlyArray<readonly [number, number]> = [
    [insetX, insetY],
    [width - insetX, insetY],
    [Math.round(width * 0.12), insetY],
    [Math.round(width * 0.88), insetY],
  ];

  try {
    return averageSampleHex(context, video, points);
  } catch {
    return null;
  }
}

function createSampleContext(): CanvasRenderingContext2D | null {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.getContext('2d', { willReadFrequently: true });
}

function averageSampleHex(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  points: ReadonlyArray<readonly [number, number]>,
): string | null {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (const [sx, sy] of points) {
    context.drawImage(video, sx, sy, 1, 1, 0, 0, 1, 1);
    const pixel = readRgbPixel(context.getImageData(0, 0, 1, 1).data);
    if (!pixel) {
      continue;
    }
    const { r, g, b } = pixel;
    if (r < MIN_ORANGE_RED || r + g + b < MIN_CHANNEL_SUM || r <= b) {
      continue;
    }
    red += r;
    green += g;
    blue += b;
    count += 1;
  }

  if (count === 0) {
    return null;
  }

  return toCssHex(
    Math.round(red / count),
    Math.round(green / count),
    Math.round(blue / count),
  );
}

function readRgbPixel(data: Uint8ClampedArray): { r: number; g: number; b: number } | null {
  const r = data[0];
  const g = data[1];
  const b = data[2];
  if (r === undefined || g === undefined || b === undefined) {
    return null;
  }
  return { r, g, b };
}

export function toCssHex(red: number, green: number, blue: number): string {
  return `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;
}

function toHexByte(value: number): string {
  return Math.min(255, Math.max(0, value)).toString(16).padStart(2, '0').toUpperCase();
}

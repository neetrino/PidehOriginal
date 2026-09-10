import Image from 'next/image';
import type { RefObject } from 'react';

/**
 * Figma 268:594 — Image (Ադանա Փիդե) on the 440-wide PDP.
 * Oversized frame so the cutout can bleed past the canvas; centered in the hero.
 * Counter-clockwise lean matches the Figma image frame on the mobile PDP.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=268-594
 */
const FRAME_WIDTH_PX = 632;
const FRAME_HEIGHT_PX = 686;
const IMAGE_ROTATE_DEG = -18;

type MobileProductImageProps = {
  src: string;
  alt: string;
  imageRef: RefObject<HTMLDivElement | null>;
};

export function MobileProductImage({ src, alt, imageRef }: MobileProductImageProps) {
  return (
    <div
      ref={imageRef}
      data-node-id="268:594"
      className="pointer-events-none absolute top-0 left-1/2 z-0 -translate-x-1/2"
      style={{
        width: FRAME_WIDTH_PX,
        height: FRAME_HEIGHT_PX,
      }}
    >
      <span
        className="absolute inset-0 origin-center"
        style={{ transform: `rotate(${IMAGE_ROTATE_DEG}deg)` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${FRAME_WIDTH_PX}px`}
          priority
          className="max-w-none object-contain"
        />
      </span>
    </div>
  );
}

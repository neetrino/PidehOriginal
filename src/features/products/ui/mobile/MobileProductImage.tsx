import Image from 'next/image';
import type { RefObject } from 'react';

/**
 * Figma 268:594 — product photo on the 440-wide PDP.
 * Shown upright and contained so catalog cutouts stay readable.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=268-594
 */
const FRAME_WIDTH_PX = 632;
const FRAME_HEIGHT_PX = 686;

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
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${FRAME_WIDTH_PX}px`}
        priority
        className="max-w-none object-contain"
      />
    </div>
  );
}

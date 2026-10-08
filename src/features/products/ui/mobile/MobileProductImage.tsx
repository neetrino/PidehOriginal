import Image from 'next/image';
import type { RefObject } from 'react';

/**
 * Product photo inside the orange PDP band.
 * Fits the hero so the whole product stays visible above the white sheet.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=268-594
 */
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
      className="pointer-events-none absolute inset-x-3 top-24 bottom-3 z-0"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        priority
        className="object-contain object-center"
      />
    </div>
  );
}

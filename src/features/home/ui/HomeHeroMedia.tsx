'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { sampleVideoTopBackdrop } from '@/features/home/ui/hero-video-backdrop';

type HomeHeroMediaProps = {
  imageSrc: string;
  /** Optional Figma Kling export — place at public/brand/pideh/hero-pide.mp4 */
  videoSrc?: string | null;
  onBackdropColor?: (color: string) => void;
};

/**
 * Full-bleed hero video (Figma 436:582). Width-driven `h-auto` shows the
 * whole frame — no contain letterbox (black side gap) and no cover crop.
 */
export function HomeHeroMedia({
  imageSrc,
  videoSrc = null,
  onBackdropColor,
}: HomeHeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const didSampleRef = useRef(false);
  const showVideo = Boolean(videoSrc) && !videoFailed;

  const reportBackdrop = (video: HTMLVideoElement) => {
    if (didSampleRef.current || !onBackdropColor) {
      return;
    }
    const color = sampleVideoTopBackdrop(video);
    if (!color) {
      return;
    }
    didSampleRef.current = true;
    onBackdropColor(color);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-x-0 top-0 pt-52 md:pt-60">
        {showVideo ? (
          <video
            className="pideh-hero-video-fade block h-auto w-full max-w-none bg-transparent"
            autoPlay
            muted
            loop
            playsInline
            poster={imageSrc}
            aria-hidden="true"
            onLoadedData={(event) => reportBackdrop(event.currentTarget)}
            onPlaying={(event) => reportBackdrop(event.currentTarget)}
            onError={() => setVideoFailed(true)}
          >
            <source src={videoSrc ?? undefined} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={imageSrc}
            alt=""
            width={2096}
            height={988}
            priority
            sizes="100vw"
            className="pideh-hero-video-fade block h-auto w-full max-w-none"
          />
        )}
      </div>
      <div
        className="pideh-hero-video-seam absolute inset-x-0 top-52 z-[1] h-12 md:top-60 md:h-14"
        aria-hidden
      />
    </div>
  );
}

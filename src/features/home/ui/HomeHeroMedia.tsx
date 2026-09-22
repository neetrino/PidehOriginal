'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { sampleVideoTopBackdrop } from '@/features/home/ui/hero-video-backdrop';
import {
  HERO_DESKTOP_MEDIA,
  HERO_VIDEO_HEIGHT,
  HERO_VIDEO_WIDTH,
} from '@/features/home/ui/hero-video';

type HomeHeroMediaProps = {
  imageSrc: string;
  /** Optional Figma Kling export — place at public/brand/pideh/hero-pide.mp4 */
  videoSrc?: string | null;
  posterSrc?: string | null;
  onBackdropColor?: (color: string) => void;
};

function useIsDesktopMd(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(HERO_DESKTOP_MEDIA);
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return isDesktop;
}

/**
 * Full-bleed hero video (Figma 436:582). Width-driven `h-auto` shows the
 * whole frame — no contain letterbox (black side gap) and no cover crop.
 * Mounted only on desktop so mobile never downloads the loop.
 */
export function HomeHeroMedia({
  imageSrc,
  videoSrc = null,
  posterSrc = null,
  onBackdropColor,
}: HomeHeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const isDesktop = useIsDesktopMd();
  const didSampleRef = useRef(false);
  const stillSrc = posterSrc ?? imageSrc;
  const showVideo = Boolean(videoSrc) && !videoFailed && isDesktop;

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
      {isDesktop ? (
        <div className="absolute inset-x-0 top-0 pt-52 md:pt-60">
          {showVideo ? (
            <video
              className="pideh-hero-video-fade block h-auto w-full max-w-none bg-transparent"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={stillSrc}
              src={videoSrc ?? undefined}
              width={HERO_VIDEO_WIDTH}
              height={HERO_VIDEO_HEIGHT}
              aria-hidden="true"
              onLoadedData={(event) => reportBackdrop(event.currentTarget)}
              onPlaying={(event) => reportBackdrop(event.currentTarget)}
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <Image
              src={stillSrc}
              alt=""
              width={HERO_VIDEO_WIDTH}
              height={HERO_VIDEO_HEIGHT}
              priority
              sizes="100vw"
              className="pideh-hero-video-fade block h-auto w-full max-w-none"
            />
          )}
        </div>
      ) : null}
      <div
        className="pideh-hero-video-seam absolute inset-x-0 top-52 z-[1] h-12 md:top-60 md:h-14"
        aria-hidden
      />
    </div>
  );
}

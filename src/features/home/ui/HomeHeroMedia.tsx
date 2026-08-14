"use client";

import Image from "next/image";
import { useState } from "react";

import { PIDEH_ASSETS } from "@/features/home/ui/brand-assets";

type HomeHeroMediaProps = {
  imageSrc: string;
  /** Optional Figma Kling export — place at public/brand/pideh/hero-pide.mp4 */
  videoSrc?: string | null;
};

/**
 * Figma hero media (51:133). Uses video when provided and loadable;
 * otherwise the static pide with a float loop approximating the clip.
 */
export function HomeHeroMedia({
  imageSrc,
  videoSrc = null,
}: HomeHeroMediaProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const showVideo = Boolean(videoSrc) && !videoFailed;

  return (
    <div className="pideh-hero-media pointer-events-none absolute inset-x-[-22%] top-[-4%] z-20 mx-auto aspect-[872/520] w-[144%] max-w-none md:inset-x-[-36%] md:top-[-10%] md:w-[172%]">
      {showVideo ? (
        <video
          className="absolute inset-0 size-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.28)]"
          autoPlay
          muted
          loop
          playsInline
          poster={imageSrc}
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
        >
          <source src={videoSrc ?? undefined} type="video/mp4" />
          <source src={PIDEH_ASSETS.heroVideoWebm} type="video/webm" />
        </video>
      ) : (
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 120vw, 1400px"
          className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.28)]"
        />
      )}
    </div>
  );
}

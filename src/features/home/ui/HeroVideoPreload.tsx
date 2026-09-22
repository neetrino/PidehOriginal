import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';
import {
  HERO_DESKTOP_MEDIA,
  HERO_VIDEO_PRELOAD_MEDIA,
} from '@/features/home/ui/hero-video';

/**
 * Hoists desktop-only preloads into the document head so the hero loop and
 * its still start during HTML parse, before the client hero hydrates.
 */
export function HeroVideoPreload() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={PIDEH_ASSETS.heroVideoPoster}
        type="image/jpeg"
        media={HERO_DESKTOP_MEDIA}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="video"
        href={PIDEH_ASSETS.heroVideoMp4}
        type="video/mp4"
        media={HERO_VIDEO_PRELOAD_MEDIA}
        fetchPriority="high"
      />
    </>
  );
}

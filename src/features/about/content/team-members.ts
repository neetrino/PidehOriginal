/** Storefront photo. Local file so it is not the older R2 about-hero still. */
export const ABOUT_HERO_IMAGE = '/brand/pideh/about-hero.jpg';

const hold = { id: 'hold', src: '/brand/pideh/about-gallery-hold.jpg', width: 768, height: 1024 } as const;
const share = { id: 'share', src: '/brand/pideh/about-gallery-share.jpg', width: 1024, height: 768 } as const;
const picnic = { id: 'picnic', src: '/brand/pideh/about-gallery-picnic.jpg', width: 768, height: 1024 } as const;
const lawn = { id: 'lawn', src: '/brand/pideh/about-gallery-lawn.jpg', width: 768, height: 1024 } as const;

export const ABOUT_GALLERY = [hold, share, picnic, lawn] as const;

/** Each frame is a side-by-side pair. */
export const ABOUT_GALLERY_SLIDES = [[hold, picnic], [share, lawn]] as const;

/** Third story chapter is shown under the share photo, not in the story list. */
export const ABOUT_STORY_UNDER_PHOTO = { index: 2, photoId: 'share' } as const;

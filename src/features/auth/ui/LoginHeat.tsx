import Image from 'next/image';

/** Local high-res food photo — no cream wash / light overlays. */
const LOGIN_FOOD_IMAGE = '/brand/pideh/login-food-bg.png';

/** Full-bleed food photo behind auth. */
export function LoginHeat() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Image
        src={LOGIN_FOOD_IMAGE}
        alt=""
        fill
        priority
        quality={95}
        sizes="100vw"
        // Slight upscale hides the soft edges the blur leaves at the viewport bounds.
        className="scale-[1.03] object-cover object-center blur-[3px]"
      />
    </div>
  );
}

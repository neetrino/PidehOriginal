import Image from 'next/image';

const LOGIN_FOOD_DESKTOP = '/brand/pideh/login-food-bg.png';
const LOGIN_FOOD_MOBILE = '/brand/pideh/login-food-bg-kitchen.png';

type LoginHeatProps = {
  /** Portrait 9:16 source used below the `md` breakpoint. */
  mobileSrc?: string;
};

/** Full-bleed food photo behind auth. */
export function LoginHeat({ mobileSrc = LOGIN_FOOD_MOBILE }: LoginHeatProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Image
        src={mobileSrc}
        alt=""
        fill
        priority
        quality={75}
        sizes="100vw"
        className="scale-[1.03] object-cover object-[center_30%] blur-[1px] md:hidden"
      />
      <Image
        src={LOGIN_FOOD_DESKTOP}
        alt=""
        fill
        quality={75}
        sizes="100vw"
        className="hidden scale-[1.03] object-cover object-center blur-[3px] md:block"
      />
    </div>
  );
}

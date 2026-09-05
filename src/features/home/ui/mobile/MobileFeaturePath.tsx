import { MOBILE_HOME_ASSETS } from "@/features/home/ui/mobile/mobile-assets";

/**
 * Figma Vector 5 (266:428) — yellow winding path behind the “why us” icons.
 *
 * Placed in the Mobile frame at left 7 / top 1341.72 with rotate 173.95°.
 * In the features band (title y=1354), that is top −12.28.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=266-428
 */
export function MobileFeaturePath() {
  return (
    <div
      aria-hidden="true"
      data-node-id="266:428"
      className="pointer-events-none absolute top-[-12.28px] left-[7px] flex h-[864.484px] w-[1857.217px] items-center justify-center"
    >
      <div className="flex-none rotate-[173.95deg]">
        <div className="relative h-[678.907px] w-[1795.634px]">
          <div className="absolute inset-[-3.02%_-1.14%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MOBILE_HOME_ASSETS.featurePath}
              alt=""
              width={1837}
              height={720}
              className="block size-full max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { MobileBranchCard } from "@/features/home/ui/mobile/MobileBranchCard";
import { MobileFrame440 } from "@/features/home/ui/mobile/MobileFrame440";

type BranchItem = {
  id: string;
  address: string;
  phoneHref: string;
  contactLabel: string;
};

type MobileHomeBranchesProps = {
  titleLine1: string;
  titleLine2: string;
  branches: readonly BranchItem[];
};

/** Title (~78) + gap 31 + two cards 148 + gap 30 + bottom breathing room. */
const BRANCHES_BAND_HEIGHT = 460;

/**
 * Figma mobile branches band (268:589) in the 440 design frame.
 *
 * @see https://www.figma.com/design/zyLVZFDhohLYxwuohIrPDN/Pideh-Dev?node-id=268-589
 */
export function MobileHomeBranches({
  titleLine1,
  titleLine2,
  branches,
}: MobileHomeBranchesProps) {
  return (
    <MobileFrame440 height={BRANCHES_BAND_HEIGHT} className="relative z-10">
      <section
        data-node-id="268:589"
        className="absolute top-0 left-1/2 flex w-[411px] -translate-x-1/2 flex-col items-start gap-[31px] overflow-visible"
      >
        <h2
          data-node-id="268:515"
          className="font-display shrink-0 text-[50px] leading-[0.78] whitespace-nowrap text-white"
        >
          <span className="mb-0 block">{titleLine1}</span>
          <span className="block">{titleLine2}</span>
        </h2>

        <ul
          data-node-id="268:588"
          className="flex w-full shrink-0 flex-col items-start gap-[30px] overflow-visible"
        >
          {branches.map((branch) => (
            <li key={branch.id} className="w-full shrink-0 list-none overflow-visible">
              <MobileBranchCard
                address={branch.address}
                phoneHref={branch.phoneHref}
                contactLabel={branch.contactLabel}
              />
            </li>
          ))}
        </ul>
      </section>
    </MobileFrame440>
  );
}

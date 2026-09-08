const AGENCY_NAME = "Neetrino IT Company";
const AGENCY_URL = "https://www.neetrino.com/";

type MobileCopyrightProps = {
  /** Full copyright sentence, year already interpolated. */
  text: string;
};

/** Figma 366:560 — centered footer line with the agency credit linked. */
export function MobileCopyright({ text }: MobileCopyrightProps) {
  const [lead, tail] = text.split(AGENCY_NAME);

  return (
    <p className="mx-auto max-w-[340px] px-4 text-center text-base leading-[21px] tracking-[0.35px] text-[#1e1e1e]">
      <span>{lead}</span>
      <a
        href={AGENCY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-[#ffd54a] underline-offset-2 hover:underline"
      >
        {AGENCY_NAME}
      </a>
      {tail}
    </p>
  );
}

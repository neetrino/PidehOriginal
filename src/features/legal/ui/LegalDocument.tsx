/** A numbered sub-clause such as "1.2." inside a legal section. */
export type LegalClause = {
  text: string;
  /** Bullets that belong to this clause rather than the whole section. */
  items: readonly string[];
};

export type LegalSection = {
  heading: string;
  /** Sentence introducing the section's bullets. */
  lead: string;
  items: readonly string[];
  clauses: readonly LegalClause[];
  /** Closing remark rendered after the bullets. */
  note: string;
};

export type LegalDocumentCopy = {
  title: string;
  /** Paragraphs shown between the title and the first section. */
  intro: readonly string[];
  sections: readonly LegalSection[];
};

type LegalDocumentProps = {
  copy: LegalDocumentCopy;
};

const BODY_TEXT = "text-base leading-7 text-[#1e1e1e]/75";
const BULLET_LIST = `list-disc space-y-2 pl-5 marker:text-[#ff6b00] ${BODY_TEXT}`;

/**
 * Renders a published legal document. Section and clause numbers come from the
 * document order, so translations only carry the copy itself.
 */
export function LegalDocument({ copy }: LegalDocumentProps) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-[clamp(2rem,6vw,3rem)] leading-[1.05] text-[#ff6b00]">
          {copy.title}
        </h1>
        {copy.intro.map((paragraph) => (
          <p key={paragraph} className={BODY_TEXT}>
            {paragraph}
          </p>
        ))}
      </header>

      {copy.sections.map((section, sectionIndex) => (
        <section key={section.heading} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-[#1e1e1e]">
            {sectionIndex + 1}. {section.heading}
          </h2>

          {section.lead ? <p className={BODY_TEXT}>{section.lead}</p> : null}

          {section.items.length > 0 ? (
            <ul className={BULLET_LIST}>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          {section.clauses.map((clause, clauseIndex) => (
            <div key={clause.text} className="flex flex-col gap-2">
              <p className={BODY_TEXT}>
                {sectionIndex + 1}.{clauseIndex + 1}. {clause.text}
              </p>
              {clause.items.length > 0 ? (
                <ul className={BULLET_LIST}>
                  {clause.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}

          {section.note ? <p className={BODY_TEXT}>{section.note}</p> : null}
        </section>
      ))}
    </article>
  );
}

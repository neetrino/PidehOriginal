import { Check } from 'lucide-react';

import { AppLink } from '@/components/ui/AppLink';

type CheckoutSuccessCardProps = {
  title: string;
  body: string;
  orderNumber: string;
  amountLabel: string;
  amountFormatted: string;
  continueHref: string;
  continueLabel: string;
  ordersHref: string | null;
  ordersLabel: string;
};

function amountCaption(template: string): string {
  return template.split('{amount}')[0]?.replace(/[\s:՝—-]+$/u, '') ?? '';
}

export function CheckoutSuccessCard({
  title,
  body,
  orderNumber,
  amountLabel,
  amountFormatted,
  continueHref,
  continueLabel,
  ordersHref,
  ordersLabel,
}: CheckoutSuccessCardProps) {
  const [before = '', after = ''] = body.split('{orderNumber}');

  return (
    <section className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
      <article className="overflow-hidden rounded-[28px] border-2 border-[#1e1e1e]/10 bg-white text-center shadow-[0px_12px_14px_rgba(31,20,8,0.08)]">
        <div className="border-b border-[#ff6b00]/15 bg-[#fff8e7] px-6 py-7">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-[#ff6b00] text-white">
            <Check className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-3xl leading-[0.9] text-[#1e1e1e] uppercase">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#1e1e1e]/65">
            {before}
            <span className="font-bold text-[#1e1e1e]">{orderNumber}</span>
            {after}
          </p>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs font-medium text-[#1e1e1e]/45">{amountCaption(amountLabel)}</p>
          <p className="mt-1 font-display text-4xl leading-none text-[#ff6b00]">{amountFormatted}</p>
          <div className="mt-6 flex flex-col gap-3">
            <AppLink
              href={continueHref}
              prefetchPolicy="intent"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#ff6b00] px-6 text-sm font-bold text-white transition hover:bg-[#e85f00]"
            >
              {continueLabel}
            </AppLink>
            {ordersHref ? (
              <AppLink
                href={ordersHref}
                prefetchPolicy="intent"
                className="inline-flex h-11 items-center justify-center rounded-full border-2 border-[#1e1e1e]/10 bg-[#fff8e7] px-6 text-sm font-bold text-[#1e1e1e] transition hover:border-[#ff6b00]"
              >
                {ordersLabel}
              </AppLink>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
}

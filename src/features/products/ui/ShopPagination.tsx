import Image from 'next/image';

import { AppLink } from '@/components/ui/AppLink';
import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';

type ShopPaginationProps = {
  paginationLabel: string;
  previousPage: string;
  nextPage: string;
  pageStatus: string;
  page: number;
  totalPages: number;
  pageHref: (page: number) => string;
};

type CatalogPageItem =
  | { kind: 'page'; page: number }
  | { kind: 'gap'; id: 'before' | 'after' };

const DOCK_CLASS =
  'inline-flex items-center gap-1 rounded-[40px] bg-white p-1.5 shadow-[0px_12px_14px_rgba(31,20,8,0.11)]';
const CONTROL_CLASS =
  'inline-flex h-11 items-center justify-center gap-1 rounded-[32px] font-montserrat-arm text-sm font-bold whitespace-nowrap transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6b00]';
const STEP_CLASS = `${CONTROL_CLASS} px-4`;
const PAGE_CLASS = `${CONTROL_CLASS} size-11`;

/**
 * Catalog pager styled like shop category chips: white dock, orange current page.
 */
export function ShopPagination({
  paginationLabel,
  previousPage,
  nextPage,
  pageStatus,
  page,
  totalPages,
  pageHref,
}: ShopPaginationProps) {
  const status = pageStatus.replace('{page}', String(page)).replace('{total}', String(totalPages));
  const items = catalogPageItems(page, totalPages);

  return (
    <nav aria-label={paginationLabel} className="mt-12 flex justify-center">
      <div className={DOCK_CLASS}>
        <PaginationStep
          href={page > 1 ? pageHref(page - 1) : null}
          label={previousPage}
          chevron="prev"
        />
        <span className="sr-only" aria-live="polite">
          {status}
        </span>
        {items.map((item) =>
          item.kind === 'gap' ? (
            <span
              key={item.id}
              className={`${PAGE_CLASS} text-[#ff6b00]/35`}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <PaginationPage
              key={item.page}
              href={pageHref(item.page)}
              page={item.page}
              current={item.page === page}
            />
          ),
        )}
        <PaginationStep
          href={page < totalPages ? pageHref(page + 1) : null}
          label={nextPage}
          chevron="next"
        />
      </div>
    </nav>
  );
}

function PaginationStep({
  href,
  label,
  chevron,
}: {
  href: string | null;
  label: string;
  chevron: 'prev' | 'next';
}) {
  const chevronImage = (
    <Image
      src={PIDEH_ASSETS.shopChevron}
      alt=""
      width={14}
      height={14}
      className={`size-3.5 shrink-0 ${chevron === 'prev' ? 'rotate-180' : ''} ${href ? '' : 'opacity-35'}`}
    />
  );

  if (!href) {
    return (
      <span className={`${STEP_CLASS} text-[#ff6b00]/35`} aria-disabled="true">
        {chevron === 'prev' ? chevronImage : null}
        {label}
        {chevron === 'next' ? chevronImage : null}
      </span>
    );
  }

  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      scroll={false}
      className={`${STEP_CLASS} text-[#ff6b00] hover:bg-[#fff8e7]`}
    >
      {chevron === 'prev' ? chevronImage : null}
      {label}
      {chevron === 'next' ? chevronImage : null}
    </AppLink>
  );
}

function PaginationPage({
  href,
  page,
  current,
}: {
  href: string;
  page: number;
  current: boolean;
}) {
  if (current) {
    return (
      <span
        aria-current="page"
        className={`${PAGE_CLASS} bg-[#ff6b00] text-[#ffd255]`}
      >
        {page}
      </span>
    );
  }

  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      scroll={false}
      className={`${PAGE_CLASS} text-[#ff6b00] hover:bg-[#fff8e7]`}
    >
      {page}
    </AppLink>
  );
}

const PAGE_WINDOW = 5;

function catalogPageItems(current: number, total: number): CatalogPageItem[] {
  if (total <= PAGE_WINDOW) {
    return Array.from({ length: total }, (_, index) => ({
      kind: 'page',
      page: index + 1,
    }));
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  const items: CatalogPageItem[] = [{ kind: 'page', page: 1 }];

  if (start > 2) {
    items.push({ kind: 'gap', id: 'before' });
  }

  for (let page = start; page <= end; page += 1) {
    items.push({ kind: 'page', page });
  }

  if (end < total - 1) {
    items.push({ kind: 'gap', id: 'after' });
  }

  items.push({ kind: 'page', page: total });
  return items;
}

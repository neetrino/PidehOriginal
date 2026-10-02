type AdminNavBadgeProps = {
  count: number;
  collapsed?: boolean;
  ariaLabel: string;
};

/** Red numeric badge for unseen admin orders in the sidebar/menu. */
export function AdminNavBadge({ count, collapsed = false, ariaLabel }: AdminNavBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <span
      className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-extrabold leading-none text-white ${
        collapsed ? 'absolute top-1 right-1 h-4 min-w-4 px-0.5' : 'h-5'
      }`}
      aria-label={ariaLabel.replace('{count}', String(count))}
    >
      {label}
    </span>
  );
}

'use client';

import { Bell } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type PanelPosition = {
  top: number;
  left: number;
};

type AdminCustomerCommentBellProps = {
  comment: string;
  ariaLabel: string;
  title: string;
};

const PANEL_WIDTH_PX = 288;
const PANEL_GAP_PX = 8;
const VIEWPORT_PADDING_PX = 8;

/**
 * Bell marker for orders whose linked customer has an admin comment.
 * Click toggles a small popover with the comment text.
 */
export function AdminCustomerCommentBell({
  comment,
  ariaLabel,
  title,
}: AdminCustomerCommentBellProps) {
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  function updatePanelPosition(): void {
    const trigger = rootRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const maxLeft = window.innerWidth - PANEL_WIDTH_PX - VIEWPORT_PADDING_PX;
    const left = Math.max(VIEWPORT_PADDING_PX, Math.min(rect.left, maxLeft));

    setPanelPosition({
      top: rect.bottom + PANEL_GAP_PX,
      left,
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      setPanelPosition(null);
      return;
    }
    updatePanelPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    function onReposition(): void {
      updatePanelPosition();
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  const panel =
    open && panelPosition
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={title}
            className="fixed z-[200] w-64 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-lg sm:w-72"
            style={{ top: panelPosition.top, left: panelPosition.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {title}
            </p>
            <p className="max-h-40 overflow-y-auto text-sm whitespace-pre-wrap text-gray-800">
              {comment}
            </p>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0">
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={panelId}
        title={title}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <Bell className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      {panel}
    </div>
  );
}

'use client';

import { Users, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { PidehPillButton } from '@/components/brand/PidehPillButton';

const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

type GroupOrderConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  stayLabel: string;
  closeLabel: string;
  confirmLabel?: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

/** Storefront popup for leaving, cancelling, or hearing that a group order ended. */
export function GroupOrderConfirmDialog(props: GroupOrderConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {props.open ? <GroupOrderConfirmPanel key="group-order-confirm" {...props} /> : null}
    </AnimatePresence>,
    document.body,
  );
}

function GroupOrderConfirmPanel({
  title,
  description,
  stayLabel,
  closeLabel,
  confirmLabel,
  pending = false,
  onClose,
  onConfirm,
}: GroupOrderConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();
  const noticeOnly = !confirmLabel || !onConfirm;

  useDialogLock(pending, onClose);

  return (
    <motion.div
      className="fixed inset-0 z-[240] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-pideh-ink/45 backdrop-blur-[3px]"
        aria-label={closeLabel}
        disabled={pending}
        onClick={() => {
          if (!pending) onClose();
        }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.32, ease: PANEL_EASE }}
        className="relative z-[1] w-full max-w-[min(420px,calc(100%-1.5rem))] overflow-hidden rounded-[28px] border-2 border-pideh-ink bg-pideh-cream shadow-[8px_8px_0_#1e1e1e]"
      >
        <div className="relative border-b-2 border-pideh-ink/10 bg-pideh-yellow/40 px-6 pt-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-pideh-orange text-white transition hover:bg-pideh-orange-hot disabled:opacity-50"
            aria-label={closeLabel}
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-pideh-orange text-white">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <h2
            id={titleId}
            className="mt-4 pr-10 text-xl leading-[1.25] font-extrabold tracking-tight text-pideh-ink"
          >
            {title}
          </h2>
        </div>
        <div className="px-6 pt-5 pb-6">
          <p id={descriptionId} className="text-sm leading-relaxed text-pideh-muted">
            {description}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <PidehPillButton
              label={stayLabel}
              tone={noticeOnly ? 'orange' : 'yellow'}
              showArrow={false}
              onClick={onClose}
              disabled={pending}
              className="w-full"
            />
            {noticeOnly ? null : (
              <button
                type="button"
                disabled={pending}
                onClick={onConfirm}
                className="inline-flex w-full items-center justify-center rounded-full border-2 border-pideh-ink/15 bg-white px-6 py-3.5 text-base font-bold text-pideh-ink transition hover:border-pideh-orange hover:text-pideh-orange disabled:opacity-50"
              >
                {pending ? '…' : confirmLabel}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function useDialogLock(pending: boolean, onClose: () => void): void {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && !pending) onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pending, onClose]);
}

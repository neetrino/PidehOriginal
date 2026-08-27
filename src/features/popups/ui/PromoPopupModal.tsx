"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type PromoPopupModalProps = {
  open: boolean;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  closeLabel: string;
  onClose: () => void;
};

/**
 * Large centered promotional image overlay for the storefront.
 */
export function PromoPopupModal({
  open,
  title,
  imageUrl,
  linkUrl,
  closeLabel,
  onClose,
}: PromoPopupModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- promo CMS image URL
    <img
      src={imageUrl}
      alt={title}
      className="max-h-[min(92vh,56rem)] w-full object-contain"
    />
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/60"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-[2] inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          aria-label={closeLabel}
        >
          <X className="h-5 w-5" />
        </button>
        {linkUrl ? (
          <a href={linkUrl} onClick={onClose} className="block">
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </div>,
    document.body,
  );
}

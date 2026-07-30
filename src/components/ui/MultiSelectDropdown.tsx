"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { DROPDOWN_ANIMATION_MS } from "@/components/ui/SelectDropdown";

export type MultiSelectOption = {
  label: string;
  value: string;
  hint?: string;
};

type MultiSelectDropdownProps = {
  ariaLabel: string;
  options: ReadonlyArray<MultiSelectOption>;
  values: ReadonlyArray<string>;
  emptyLabel: string;
  className?: string;
  disabled?: boolean;
  onValuesChange: (values: string[]) => void;
};

export function MultiSelectDropdown({
  ariaLabel,
  options,
  values,
  emptyLabel,
  className = "",
  disabled = false,
  onValuesChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = new Set(values);

  const summary =
    values.length === 0
      ? emptyLabel
      : options
          .filter((option) => selected.has(option.value))
          .map((option) => option.label)
          .join(", ");

  useEffect(() => {
    if (open) {
      setElevated(true);
      return;
    }
    const timer = setTimeout(() => setElevated(false), DROPDOWN_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle(value: string): void {
    if (selected.has(value)) {
      onValuesChange(values.filter((id) => id !== value));
      return;
    }
    onValuesChange([...values, value]);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled || options.length === 0}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm text-gray-900 transition hover:border-gray-300 disabled:opacity-40"
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {elevated ? (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className={`absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg transition ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {options.map((option) => {
            const isSelected = selected.has(option.value);
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                  onClick={() => toggle(option.value)}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="h-3 w-3" aria-hidden />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {option.hint ? (
                    <span className="shrink-0 text-xs text-gray-500">
                      {option.hint}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { autocompleteAddressAction } from "@/features/delivery/application/autocomplete-address";
import type { PlaceAutocompleteSuggestion } from "@/lib/maps/types";

const DEBOUNCE_MS = 280;

type AddressAutocompleteProps = {
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  languageCode?: "hy" | "en" | "ru";
  autoComplete?: string;
};

export function AddressAutocomplete({
  name,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  required = false,
  className = "",
  languageCode = "hy",
  autoComplete = "street-address",
}: AddressAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteSuggestion[]>(
    [],
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    function onPointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
      }
      requestIdRef.current += 1;
    };
  }, []);

  function clearSuggestions(): void {
    setSuggestions([]);
    setOpen(false);
    setPending(false);
    setError(null);
    setHighlightIndex(-1);
  }

  function scheduleFetch(input: string): void {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }

    const trimmed = input.trim();
    if (trimmed.length < 2 || disabled) {
      requestIdRef.current += 1;
      clearSuggestions();
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setPending(true);

    debounceRef.current = window.setTimeout(() => {
      void autocompleteAddressAction({
        input: trimmed,
        languageCode,
      }).then((result) => {
        if (requestIdRef.current !== requestId) return;
        setPending(false);
        if (!result.ok) {
          setSuggestions([]);
          setError(result.error);
          setOpen(false);
          return;
        }
        setError(null);
        setSuggestions(result.suggestions);
        setOpen(result.suggestions.length > 0);
        setHighlightIndex(-1);
      });
    }, DEBOUNCE_MS);
  }

  function selectSuggestion(suggestion: PlaceAutocompleteSuggestion): void {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }
    requestIdRef.current += 1;
    onValueChange(suggestion.fullText);
    clearSuggestions();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (!open || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
      return;
    }
    if (event.key === "Enter" && highlightIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[highlightIndex];
      if (selected) {
        selectSuggestion(selected);
      }
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        name={name}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          onValueChange(next);
          scheduleFetch(next);
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={className}
        autoComplete={autoComplete}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
      />

      {pending ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          …
        </span>
      ) : null}

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => {
            const active = index === highlightIndex;
            return (
              <li key={suggestion.placeId} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full flex-col items-start px-4 py-2.5 text-left text-sm ${
                    active ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="font-medium text-gray-900">
                    {suggestion.primaryText}
                  </span>
                  {suggestion.secondaryText ? (
                    <span className="text-xs text-gray-500">
                      {suggestion.secondaryText}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? <p className="mt-1 text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}

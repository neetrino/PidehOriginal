"use client";

import { X } from "lucide-react";
import { useState, useTransition } from "react";

import {
  ADMIN_INPUT,
} from "@/features/admin/ui/admin-form-classes";
import type { ProductModifierOption } from "@/features/products/types/modifiers";
import {
  createProductModifierAction,
  deactivateProductModifierAction,
} from "@/features/products/application/modifier-actions";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ModifiersCopy = Dictionary["admin"]["products"]["modifiers"];

type ProductDrawerModifiersProps = {
  locale: string;
  library: ProductModifierOption[];
  selectedIds: string[];
  disabled?: boolean;
  onLibraryChange: (next: ProductModifierOption[]) => void;
  onSelectedChange: (next: string[]) => void;
  copy: ModifiersCopy;
};

type ColumnKind = "ADDITION" | "EXCEPTION";

export function ProductDrawerModifiers({
  locale,
  library,
  selectedIds,
  disabled = false,
  onLibraryChange,
  onSelectedChange,
  copy,
}: ProductDrawerModifiersProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {copy.sectionTitle}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">{copy.sectionHint}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ModifierColumn
          locale={locale}
          kind="ADDITION"
          title={copy.addition}
          subtitle={copy.additionSubtitle}
          placeholder={copy.additionPlaceholder}
          withPrice
          library={library}
          selectedIds={selectedIds}
          disabled={disabled}
          copy={copy}
          onLibraryChange={onLibraryChange}
          onSelectedChange={onSelectedChange}
        />
        <ModifierColumn
          locale={locale}
          kind="EXCEPTION"
          title={copy.exception}
          subtitle={copy.exceptionSubtitle}
          placeholder={copy.exceptionPlaceholder}
          withPrice={false}
          library={library}
          selectedIds={selectedIds}
          disabled={disabled}
          copy={copy}
          onLibraryChange={onLibraryChange}
          onSelectedChange={onSelectedChange}
        />
      </div>
    </div>
  );
}

function ModifierColumn({
  locale,
  kind,
  title,
  subtitle,
  placeholder,
  withPrice,
  library,
  selectedIds,
  disabled,
  copy,
  onLibraryChange,
  onSelectedChange,
}: {
  locale: string;
  kind: ColumnKind;
  title: string;
  subtitle: string;
  placeholder: string;
  withPrice: boolean;
  library: ProductModifierOption[];
  selectedIds: string[];
  disabled: boolean;
  copy: ModifiersCopy;
  onLibraryChange: (next: ProductModifierOption[]) => void;
  onSelectedChange: (next: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rows = library.filter((row) => row.kind === kind && row.isActive);
  const selectedSet = new Set(selectedIds);

  function toggle(id: string, checked: boolean): void {
    if (checked) {
      onSelectedChange([...selectedIds, id]);
      return;
    }
    onSelectedChange(selectedIds.filter((value) => value !== id));
  }

  function handleAdd(): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    const priceAmount = withPrice ? Number(price) : 0;
    if (withPrice && (!Number.isFinite(priceAmount) || priceAmount < 0)) {
      setError(copy.priceMustBeNonNegative);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createProductModifierAction(locale, {
        kind,
        name: trimmed,
        priceAmount: withPrice ? Math.floor(priceAmount) : 0,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      const created = result.value;
      const without = library.filter((row) => row.id !== created.id);
      onLibraryChange([
        ...without,
        {
          ...created,
          linked: true,
          sortOrder: 0,
        },
      ]);
      if (!selectedSet.has(created.id)) {
        onSelectedChange([...selectedIds, created.id]);
      }
      setName("");
      setPrice("");
    });
  }

  function handleRemove(id: string): void {
    setError(null);
    startTransition(async () => {
      const result = await deactivateProductModifierAction(locale, id);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onLibraryChange(
        library.map((row) =>
          row.id === id ? { ...row, isActive: false, linked: false } : row,
        ),
      );
      onSelectedChange(selectedIds.filter((value) => value !== id));
    });
  }

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-3 py-2.5">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <ul className="max-h-56 flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        {rows.length === 0 ? (
          <li className="px-2 py-3 text-xs text-gray-400">{copy.empty}</li>
        ) : (
          rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(row.id)}
                disabled={disabled || pending}
                onChange={(event) => toggle(row.id, event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900"
                aria-label={row.name}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                {row.name}
                {withPrice ? (
                  <span className="ml-1 text-xs text-gray-500">
                    {copy.priceAmd.replace("{amount}", String(row.priceAmount))}
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                disabled={disabled || pending}
                onClick={() => handleRemove(row.id)}
                className="rounded p-1 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                aria-label={copy.removeAria.replace("{name}", row.name)}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="space-y-2 border-t border-gray-100 px-2 py-2">
        <div className={withPrice ? "grid grid-cols-[1fr_5.5rem] gap-2" : ""}>
          <label className="block">
            <span className="sr-only">{placeholder}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={placeholder}
              disabled={disabled || pending}
              className={ADMIN_INPUT}
            />
          </label>
          {withPrice ? (
            <label className="block">
              <span className="sr-only">{copy.priceAmdAria}</span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder={copy.pricePlaceholder}
                disabled={disabled || pending}
                className={ADMIN_INPUT}
              />
            </label>
          ) : null}
        </div>
        <button
          type="button"
          disabled={disabled || pending || !name.trim()}
          onClick={handleAdd}
          className="flex h-10 w-full items-center justify-center rounded-xl bg-gray-800 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-40"
        >
          {copy.add}
        </button>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

import type { ProductModifierChoice } from "@/features/products/types";

type ProductModifierCheckTagsProps = {
  options: readonly ProductModifierChoice[];
  selectedIds: readonly string[];
  disabled: boolean;
  groupLabel: string;
  onToggle: (id: string) => void;
};

export function ProductModifierCheckTags({
  options,
  selectedIds,
  disabled,
  groupLabel,
  onToggle,
}: ProductModifierCheckTagsProps) {
  const selected = new Set(selectedIds);

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className="flex flex-wrap gap-2.5"
    >
      {options.map((option) => {
        const isOn = selected.has(option.id);
        return (
          <button
            key={option.id}
            type="button"
            role="checkbox"
            aria-checked={isOn}
            disabled={disabled}
            onClick={() => onToggle(option.id)}
            className="inline-flex items-center gap-2 rounded-[12px] bg-white px-3 py-2 text-base text-[#1e1e1e] transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              aria-hidden
              className={`size-4 shrink-0 rounded-[4px] border border-[#ff6b00] ${
                isOn ? "bg-[#ff6b00]" : "bg-white"
              }`}
            />
            {option.name}
          </button>
        );
      })}
    </div>
  );
}

export function toggleModifierId(
  current: readonly string[],
  id: string,
): string[] {
  return current.includes(id)
    ? current.filter((value) => value !== id)
    : [...current, id];
}

type ProductOption = {
  id: string;
  label: string;
};

type ProductOptionPillsProps = {
  groupLabel: string;
  options: readonly ProductOption[];
  selectedId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
};

export function ProductOptionPills({
  groupLabel,
  options,
  selectedId,
  disabled,
  onSelect,
}: ProductOptionPillsProps) {
  return (
    <div role="radiogroup" aria-label={groupLabel} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isOn = option.id === selectedId;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isOn}
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className={`inline-flex h-[38px] items-center justify-center rounded-full px-4 text-sm whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isOn
                ? "bg-[#ff6b00] font-extrabold text-white"
                : "border border-[rgba(255,107,0,0.41)] bg-transparent font-medium text-[#1e1e1e] hover:border-[#ff6b00]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

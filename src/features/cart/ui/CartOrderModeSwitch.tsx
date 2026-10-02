'use client';

type CartOrderMode = 'group' | 'personal';

type CartOrderModeSwitchProps = {
  mode: CartOrderMode;
  groupLabel: string;
  personalLabel: string;
  hint: string;
  disabled: boolean;
  onChange: (mode: CartOrderMode) => void;
};

/** Chooses the open group order or a regular personal order. */
export function CartOrderModeSwitch({
  mode,
  groupLabel,
  personalLabel,
  hint,
  disabled,
  onChange,
}: CartOrderModeSwitchProps) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs leading-4 text-[#1e1e1e]/60">{hint}</p>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-white p-1">
        <ModeButton
          active={mode === 'group'}
          disabled={disabled}
          label={groupLabel}
          onClick={() => onChange('group')}
        />
        <ModeButton
          active={mode === 'personal'}
          disabled={disabled}
          label={personalLabel}
          onClick={() => onChange('personal')}
        />
      </div>
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-full px-2 text-xs font-bold transition disabled:opacity-60 ${
        active ? 'bg-[#ff6b00] text-white' : 'bg-transparent text-[#1e1e1e]'
      }`}
    >
      {label}
    </button>
  );
}

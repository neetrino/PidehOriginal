import { PIDEH_ASSETS } from '@/features/home/ui/brand-assets';
import { ProductSectionHeading } from '@/features/products/ui/ProductSectionHeading';

type ProductSpecialRequestsFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  minHeightClassName?: string;
  onChange: (value: string) => void;
};

export function ProductSpecialRequestsField({
  label,
  placeholder,
  value,
  disabled,
  minHeightClassName = 'min-h-[84px]',
  onChange,
}: ProductSpecialRequestsFieldProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <ProductSectionHeading
        iconSrc={PIDEH_ASSETS.pdpEdit}
        iconWidth={14}
        iconHeight={14}
        title={label}
        tone="onInk"
        titleSize="md"
      />
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`font-noto-armenian w-full resize-none rounded-[16px] border-0 bg-[rgba(255,107,0,0.09)] px-4 py-3 text-sm leading-5 text-[#1e1e1e] placeholder:text-[rgba(204,86,0,0.48)] focus-visible:ring-2 focus-visible:ring-[#ff6b00]/40 focus-visible:outline-none disabled:opacity-50 ${minHeightClassName}`}
      />
    </div>
  );
}

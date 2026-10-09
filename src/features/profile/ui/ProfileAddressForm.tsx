'use client';

import type { FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_OUTLINE_BTN,
  PROFILE_PRIMARY_BTN,
} from '@/features/profile/ui/profile-ui-classes';
export type ProfileDeliveryCommunityOption = {
  id: string;
  label: string;
  sourceCity: string;
  sourceRegion: string;
};

export type ProfileAddressFormState = {
  line1: string;
  deliveryRuleId: string;
  isDefault: boolean;
};

type ProfileAddressFormLabels = {
  formAddTitle: string;
  formEditTitle: string;
  community: string;
  selectCommunity: string;
  line1: string;
  isDefault: string;
  cancel: string;
  add: string;
  update: string;
  saving: string;
};

type ProfileAddressFormProps = {
  editing: boolean;
  form: ProfileAddressFormState;
  communities: ProfileDeliveryCommunityOption[];
  labels: ProfileAddressFormLabels;
  isPending: boolean;
  onFormChange: (next: ProfileAddressFormState) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ProfileAddressForm({
  editing,
  form,
  communities,
  labels,
  isPending,
  onFormChange,
  onCancel,
  onSubmit,
}: ProfileAddressFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-8 space-y-5 rounded-2xl border border-dashed border-[#ff6b00]/30 bg-[#fff8e7] p-4 sm:mb-10 sm:p-6"
    >
      <h2 className="text-base font-semibold text-[#1e1e1e]">
        {editing ? labels.formEditTitle : labels.formAddTitle}
      </h2>
      <div className="space-y-5 sm:space-y-6">
        <div className="space-y-1.5">
          <span className="text-sm font-bold text-[#1e1e1e]">{labels.community}</span>
          <SelectDropdown
            ariaLabel={labels.community}
            value={form.deliveryRuleId}
            allLabel={labels.selectCommunity}
            options={communities.map((community) => ({
              value: community.id,
              label: community.label,
            }))}
            onValueChange={(value) => onFormChange({ ...form, deliveryRuleId: value })}
            disabled={isPending || communities.length === 0}
            tone="brand"
            className="w-full"
          />
        </div>
        <label className={PROFILE_LABEL}>
          {labels.line1}
          <input
            required
            value={form.line1}
            onChange={(event) => onFormChange({ ...form, line1: event.target.value })}
            className={PROFILE_FIELD}
            autoComplete="street-address"
          />
        </label>
      </div>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(event) => onFormChange({ ...form, isDefault: event.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-[#ff6b00] focus:ring-[#ff6b00]"
        />
        <span className="text-sm text-[#1e1e1e]">{labels.isDefault}</span>
      </label>
      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:gap-3">
        <Button
          type="button"
          variant="outline"
          className={`h-11 w-full sm:w-auto ${PROFILE_OUTLINE_BTN}`}
          onClick={onCancel}
          disabled={isPending}
        >
          {labels.cancel}
        </Button>
        <Button
          type="submit"
          variant="primary"
          className={`h-11 w-full sm:w-auto ${PROFILE_PRIMARY_BTN}`}
          disabled={isPending}
        >
          {isPending ? labels.saving : editing ? labels.update : labels.add}
        </Button>
      </div>
    </form>
  );
}

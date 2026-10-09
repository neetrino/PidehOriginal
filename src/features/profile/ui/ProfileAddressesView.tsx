'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { findDeliveryZoneIdByAddress } from '@/features/delivery/domain/delivery-location';
import { PROFILE_PANEL, PROFILE_PRIMARY_BTN } from '@/features/profile/ui/profile-ui-classes';
import { ProfilePageHeading } from '@/features/profile/ui/ProfilePageHeading';
import {
  createCustomerAddressAction,
  deleteCustomerAddressAction,
  setDefaultCustomerAddressAction,
  updateCustomerAddressAction,
} from '@/features/profile/application/manage-addresses';
import type { CustomerAddressListItem } from '@/features/profile/application/address-queries';
import {
  ProfileAddressForm,
  type ProfileAddressFormState,
  type ProfileDeliveryCommunityOption,
} from '@/features/profile/ui/ProfileAddressForm';
import { ProfileAddressCard } from '@/features/profile/ui/ProfileAddressCard';

export type { ProfileDeliveryCommunityOption };

type ProfileAddressesViewProps = {
  locale: string;
  addresses: CustomerAddressListItem[];
  communities: ProfileDeliveryCommunityOption[];
  labels: {
    eyebrow: string;
    title: string;
    addNew: string;
    defaultBadge: string;
    setDefault: string;
    edit: string;
    delete: string;
    deleteConfirm: string;
    noAddresses: string;
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
    added: string;
    updated: string;
    deleted: string;
    defaultUpdated: string;
    saveFailed: string;
    notFound: string;
    validationError: string;
  };
};

const emptyForm: ProfileAddressFormState = {
  line1: '',
  deliveryRuleId: '',
  isDefault: false,
};

function resolveAddressError(
  code: string,
  labels: ProfileAddressesViewProps['labels'],
  fallback: string,
): string {
  if (code === 'VALIDATION_ERROR') return labels.validationError;
  if (code === 'NOT_FOUND') return labels.notFound;
  if (code === 'SAVE_FAILED') return labels.saveFailed;
  return fallback;
}

export function ProfileAddressesView({
  locale,
  addresses,
  communities,
  labels,
}: ProfileAddressesViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileAddressFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function communityLabelFor(address: CustomerAddressListItem): string | null {
    const zoneId = findDeliveryZoneIdByAddress(communities, address);
    return communities.find((item) => item.id === zoneId)?.label ?? address.region;
  }

  function resetForm(): void {
    setForm(emptyForm);
    setEditingId(null);
  }

  function closeForm(): void {
    setShowForm(false);
    resetForm();
  }

  function toggleForm(): void {
    if (showForm) {
      closeForm();
      return;
    }
    resetForm();
    setShowForm(true);
  }

  function startEdit(address: CustomerAddressListItem): void {
    setEditingId(address.id);
    setForm({
      line1: address.line1,
      deliveryRuleId: findDeliveryZoneIdByAddress(communities, address),
      isDefault: address.isDefaultShipping,
    });
    setShowForm(true);
    setError(null);
    setMessage(null);
  }

  function onSave(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.deliveryRuleId) {
      setError(labels.selectCommunity);
      return;
    }

    startTransition(async () => {
      const result = editingId
        ? await updateCustomerAddressAction(locale, editingId, form)
        : await createCustomerAddressAction(locale, form);

      if (!result.ok) {
        setError(resolveAddressError(result.error.code, labels, result.error.message));
        return;
      }

      setMessage(editingId ? labels.updated : labels.added);
      closeForm();
      router.refresh();
    });
  }

  function confirmDelete(): void {
    if (!pendingDeleteId) return;
    const addressId = pendingDeleteId;

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await deleteCustomerAddressAction(locale, addressId);
      if (!result.ok) {
        setError(resolveAddressError(result.error.code, labels, result.error.message));
        return;
      }
      setMessage(labels.deleted);
      setPendingDeleteId(null);
      if (editingId === addressId) closeForm();
      router.refresh();
    });
  }

  function onSetDefault(addressId: string): void {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await setDefaultCustomerAddressAction(locale, addressId);
      if (!result.ok) {
        setError(resolveAddressError(result.error.code, labels, result.error.message));
        return;
      }
      setMessage(labels.defaultUpdated);
      router.refresh();
    });
  }

  return (
    <div className="profile-sheet-keep-frame space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <ProfilePageHeading eyebrow={labels.eyebrow} title={labels.title} />
        <Button
          type="button"
          variant="primary"
          className={`h-11 w-full shrink-0 sm:w-auto ${PROFILE_PRIMARY_BTN}`}
          onClick={toggleForm}
          disabled={isPending}
        >
          {showForm ? labels.cancel : `+ ${labels.addNew}`}
        </Button>
      </div>
      <div className={PROFILE_PANEL}>
        {showForm ? (
          <ProfileAddressForm
            editing={editingId !== null}
            form={form}
            communities={communities}
            labels={labels}
            isPending={isPending}
            onFormChange={setForm}
            onCancel={closeForm}
            onSubmit={onSave}
          />
        ) : null}

        {error ? (
          <p className="mb-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mb-4 text-sm text-green-700" role="status">
            {message}
          </p>
        ) : null}

        <div className="space-y-4 sm:space-y-5">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <ProfileAddressCard
                key={address.id}
                address={address}
                communityLabel={communityLabelFor(address)}
                disabled={isPending}
                labels={{
                  defaultBadge: labels.defaultBadge,
                  setDefault: labels.setDefault,
                  edit: labels.edit,
                  delete: labels.delete,
                }}
                onSetDefault={onSetDefault}
                onEdit={startEdit}
                onDelete={setPendingDeleteId}
              />
            ))
          ) : (
            <p className="rounded-2xl bg-[#fff8e7] py-12 text-center text-sm text-[#1e1e1e]/60 sm:py-16">
              {labels.noAddresses}
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={labels.delete}
        description={labels.deleteConfirm}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        isPending={isPending}
        onClose={() => {
          if (!isPending) setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

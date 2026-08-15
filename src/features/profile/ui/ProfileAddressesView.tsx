"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import {
  ConfirmDialog,
} from "@/components/ui/ConfirmDialog";
import {
  PROFILE_FIELD,
  PROFILE_LABEL,
  PROFILE_OUTLINE_BTN,
  PROFILE_PANEL,
  PROFILE_PRIMARY_BTN,
} from "@/features/profile/ui/profile-ui-classes";
import { ProfilePageHeading } from "@/features/profile/ui/ProfilePageHeading";
import {
  createCustomerAddressAction,
  deleteCustomerAddressAction,
  setDefaultCustomerAddressAction,
  updateCustomerAddressAction,
} from "@/features/profile/application/manage-addresses";
import type { CustomerAddressListItem } from "@/features/profile/application/address-queries";
import { ProfileAddressCard } from "@/features/profile/ui/ProfileAddressCard";

type AddressFormState = {
  line1: string;
  city: string;
  phone: string;
  isDefault: boolean;
};

type ProfileAddressesViewProps = {
  locale: string;
  addresses: CustomerAddressListItem[];
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
    line1: string;
    city: string;
    phone: string;
    phonePlaceholder: string;
    isDefault: string;
    cancel: string;
    add: string;
    update: string;
    saving: string;
  };
};

const emptyForm: AddressFormState = {
  line1: "",
  city: "",
  phone: "",
  isDefault: false,
};

export function ProfileAddressesView({
  locale,
  addresses,
  labels,
}: ProfileAddressesViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function resetForm(): void {
    setForm(emptyForm);
    setEditingId(null);
  }

  function toggleForm(): void {
    if (showForm) {
      setShowForm(false);
      resetForm();
      return;
    }
    resetForm();
    setShowForm(true);
  }

  function startEdit(address: CustomerAddressListItem): void {
    setEditingId(address.id);
    setForm({
      line1: address.line1,
      city: address.city,
      phone: address.phone,
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

    startTransition(async () => {
      const result = editingId
        ? await updateCustomerAddressAction(locale, editingId, form)
        : await createCustomerAddressAction(locale, form);

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setMessage(editingId ? "Address updated." : "Address added.");
      setShowForm(false);
      resetForm();
      router.refresh();
    });
  }

  function onDelete(addressId: string): void {
    setPendingDeleteId(addressId);
  }

  function confirmDelete(): void {
    if (!pendingDeleteId) return;
    const addressId = pendingDeleteId;

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await deleteCustomerAddressAction(locale, addressId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage("Address deleted.");
      setPendingDeleteId(null);
      if (editingId === addressId) {
        setShowForm(false);
        resetForm();
      }
      router.refresh();
    });
  }

  function onSetDefault(addressId: string): void {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await setDefaultCustomerAddressAction(locale, addressId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage("Default address updated.");
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
          <form
            onSubmit={onSave}
            className="mb-8 space-y-5 rounded-2xl border border-dashed border-[#ff6b00]/30 bg-[#fff8e7] p-4 sm:mb-10 sm:p-6"
          >
            <h2 className="text-base font-semibold text-[#1e1e1e]">
              {editingId ? labels.formEditTitle : labels.formAddTitle}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <label className={PROFILE_LABEL}>
                {labels.line1}
                <input
                  required
                  value={form.line1}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, line1: event.target.value }))
                  }
                  className={PROFILE_FIELD}
                  autoComplete="street-address"
                />
              </label>
              <label className={PROFILE_LABEL}>
                {labels.city}
                <input
                  required
                  value={form.city}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                  className={PROFILE_FIELD}
                  autoComplete="address-level2"
                />
              </label>
              <label className={`${PROFILE_LABEL} sm:col-span-2`}>
                {labels.phone}
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder={labels.phonePlaceholder}
                  className={PROFILE_FIELD}
                  autoComplete="tel"
                />
              </label>
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    isDefault: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-[#ff6b00] focus:ring-[#ff6b00]"
              />
              <span className="text-sm text-[#1e1e1e]">{labels.isDefault}</span>
            </label>
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className={`h-11 w-full sm:w-auto ${PROFILE_OUTLINE_BTN}`}
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
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
                {isPending
                  ? labels.saving
                  : editingId
                    ? labels.update
                    : labels.add}
              </Button>
            </div>
          </form>
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
                disabled={isPending}
                labels={{
                  defaultBadge: labels.defaultBadge,
                  setDefault: labels.setDefault,
                  edit: labels.edit,
                  delete: labels.delete,
                }}
                onSetDefault={onSetDefault}
                onEdit={startEdit}
                onDelete={onDelete}
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

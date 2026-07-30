"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
} from "@/features/admin/ui/admin-form-classes";
import { uploadCashChangeImageAction } from "@/features/delivery/application/upload-cash-change-image";
import type { CashChangeDenomination } from "@/features/delivery/domain/cash-change";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type CashChangeCopy = Dictionary["admin"]["delivery"]["cashChange"];

type AdminCashChangeEditorProps = {
  locale: string;
  value: CashChangeDenomination[];
  imageUrls: Record<string, string>;
  onChange: (next: CashChangeDenomination[]) => void;
  onImageUrlsChange: (next: Record<string, string>) => void;
  disabled?: boolean;
  copy: CashChangeCopy;
};

export function AdminCashChangeEditor({
  locale,
  value,
  imageUrls,
  onChange,
  onImageUrlsChange,
  disabled = false,
  copy,
}: AdminCashChangeEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  function updateItem(
    id: string,
    patch: Partial<CashChangeDenomination>,
  ): void {
    onChange(
      value.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addItem(): void {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        amount: 0,
        imageObjectKey: null,
        isActive: true,
        sortOrder: value.length,
      },
    ]);
  }

  function removeItem(id: string): void {
    onChange(value.filter((item) => item.id !== id));
    const nextUrls = { ...imageUrls };
    delete nextUrls[id];
    onImageUrlsChange(nextUrls);
  }

  function pickImage(id: string): void {
    setUploadTargetId(id);
    setError(null);
    fileInputRef.current?.click();
  }

  function onFileSelected(fileList: FileList | null): void {
    const file = fileList?.[0];
    const targetId = uploadTargetId;
    if (!file || !targetId) return;

    startUpload(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadCashChangeImageAction(locale, formData);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      updateItem(targetId, { imageObjectKey: result.value.objectKey });
      onImageUrlsChange({
        ...imageUrls,
        [targetId]: result.value.url,
      });
      setUploadTargetId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{copy.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{copy.hint}</p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => onFileSelected(event.target.files)}
      />

      <ul className="space-y-3">
        {value.map((item) => {
          const previewUrl = imageUrls[item.id] ?? null;
          return (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center"
            >
              <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote/local object URL
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-2 text-center text-xs text-gray-400">
                    {copy.noImage}
                  </span>
                )}
              </div>

              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <label>
                  <span className={ADMIN_LABEL}>{copy.amount}</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={item.amount > 0 ? String(item.amount) : ""}
                    onChange={(event) =>
                      updateItem(item.id, {
                        amount: Number(event.target.value) || 0,
                      })
                    }
                    placeholder={copy.amountPlaceholder}
                    className={ADMIN_INPUT}
                    disabled={disabled || isUploading}
                  />
                  {item.amount > 0 ? (
                    <span className="mt-1 block text-xs text-gray-500">
                      {formatMoneyAmount(item.amount, "AMD", locale)}
                    </span>
                  ) : null}
                </label>

                <label className="inline-flex items-center gap-2 pb-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(event) =>
                      updateItem(item.id, { isActive: event.target.checked })
                    }
                    disabled={disabled || isUploading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {copy.active}
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={disabled || isUploading}
                    onClick={() => pickImage(item.id)}
                  >
                    {isUploading && uploadTargetId === item.id
                      ? copy.uploading
                      : previewUrl
                        ? copy.changeImage
                        : copy.uploadImage}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={disabled || isUploading}
                    onClick={() => removeItem(item.id)}
                  >
                    {copy.remove}
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || isUploading || value.length >= 20}
          onClick={addItem}
        >
          {copy.add}
        </Button>
      </div>
    </div>
  );
}

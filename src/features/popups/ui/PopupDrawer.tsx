"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
} from "@/features/admin/ui/admin-form-classes";
import {
  createPopupAction,
  updatePopupAction,
} from "@/features/popups/application/manage-popups";
import type { AdminPopupListItem } from "@/features/popups/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type PopupDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  popup?: AdminPopupListItem | null;
  copy: Dictionary["admin"];
};

export function PopupDrawer({
  locale,
  open,
  onClose,
  popup = null,
  copy,
}: PopupDrawerProps) {
  const isEdit = popup != null;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={
        isEdit ? copy.popups.drawer.editAria : copy.popups.drawer.createAria
      }
      panelClassName="w-full sm:w-1/2"
    >
      <PopupDrawerForm
        key={popup?.id ?? "create"}
        locale={locale}
        onClose={onClose}
        popup={popup}
        copy={copy}
      />
    </SideSheet>
  );
}

type PopupDrawerFormProps = {
  locale: string;
  onClose: () => void;
  popup: AdminPopupListItem | null;
  copy: Dictionary["admin"];
};

function PopupDrawerForm({
  locale,
  onClose,
  popup,
  copy,
}: PopupDrawerFormProps) {
  const router = useRouter();
  const isEdit = popup != null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(popup?.title ?? "");
  const [linkUrl, setLinkUrl] = useState(popup?.linkUrl ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    popup?.imageUrl ?? null,
  );
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit =
    title.trim().length > 0 &&
    (Boolean(imageFile) || (isEdit && Boolean(imagePreview) && !removeExistingImage));

  return (
    <>
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit
            ? copy.popups.drawer.editTitle
            : copy.popups.drawer.createTitle}
        </h2>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData();
          formData.set("title", title.trim());
          formData.set("linkUrl", linkUrl.trim());
          if (imageFile) {
            formData.set("image", imageFile);
          }
          if (removeExistingImage) {
            formData.set("removeImage", "1");
          }

          startTransition(async () => {
            setError(null);
            const result =
              isEdit && popup
                ? await updatePopupAction(locale, popup.id, formData)
                : await createPopupAction(locale, formData);

            if (!result.ok) {
              setError(result.error.message);
              return;
            }

            onClose();
            router.refresh();
          });
        }}
      >
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <label className="block">
            <span className={ADMIN_LABEL}>{copy.popups.drawer.title}</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={ADMIN_INPUT}
              disabled={isPending}
            />
          </label>

          <label className="block">
            <span className={ADMIN_LABEL}>{copy.popups.drawer.linkUrl}</span>
            <input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              className={ADMIN_INPUT}
              placeholder={copy.popups.drawer.linkUrlPlaceholder}
              disabled={isPending}
            />
            <span className="mt-1 block text-xs text-gray-500">
              {copy.popups.drawer.linkUrlHint}
            </span>
          </label>

          <div>
            <span className={ADMIN_LABEL}>{copy.popups.drawer.uploadImage}</span>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
              >
                {imagePreview
                  ? copy.popups.drawer.changeImage
                  : copy.popups.drawer.uploadImageButton}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  event.target.value = "";
                  setImagePreview((current) => {
                    if (current?.startsWith("blob:")) {
                      URL.revokeObjectURL(current);
                    }
                    return file ? URL.createObjectURL(file) : null;
                  });
                  setImageFile(file);
                  setRemoveExistingImage(false);
                }}
              />
              {imagePreview ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview((current) => {
                      if (current?.startsWith("blob:")) {
                        URL.revokeObjectURL(current);
                      }
                      return null;
                    });
                    if (isEdit && popup?.imageUrl) {
                      setRemoveExistingImage(true);
                    }
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-red-600"
                >
                  {copy.popups.drawer.remove}
                </button>
              ) : null}
            </div>
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob/admin preview
              <img
                src={imagePreview}
                alt=""
                className="mt-3 max-h-64 w-full rounded-xl border border-gray-200 object-contain"
              />
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="flex items-center gap-4 border-t border-gray-200 px-5 py-4">
          <Button type="submit" disabled={isPending || !canSubmit}>
            {isPending
              ? isEdit
                ? copy.common.saving
                : copy.common.creating
              : isEdit
                ? copy.popups.drawer.edit
                : copy.popups.drawer.create}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {copy.common.cancel}
          </button>
        </div>
      </form>
    </>
  );
}

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
  createHeroSlideAction,
  updateHeroSlideAction,
} from "@/features/hero/application/manage-hero";
import type { AdminHeroSlideListItem } from "@/features/hero/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type HeroSlideModalProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  slide?: AdminHeroSlideListItem | null;
  copy: Dictionary["admin"];
};

export function HeroSlideModal({
  locale,
  open,
  onClose,
  slide = null,
  copy,
}: HeroSlideModalProps) {
  const isEdit = slide != null;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.hero.drawer.editAria : copy.hero.drawer.createAria}
      panelClassName="w-full max-w-lg"
    >
      <HeroSlideDrawerForm
        key={slide?.id ?? "create"}
        locale={locale}
        onClose={onClose}
        slide={slide}
        copy={copy}
      />
    </SideSheet>
  );
}

type HeroSlideDrawerFormProps = {
  locale: string;
  onClose: () => void;
  slide: AdminHeroSlideListItem | null;
  copy: Dictionary["admin"];
};

function HeroSlideDrawerForm({
  locale,
  onClose,
  slide,
  copy,
}: HeroSlideDrawerFormProps) {
  const router = useRouter();
  const isEdit = slide != null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(
    slide && slide.title !== "Untitled" ? slide.title : "",
  );
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    slide?.imageUrl ?? null,
  );
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? copy.hero.drawer.editTitle : copy.hero.drawer.createTitle}
          </h2>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData();
            formData.set("title", title.trim());
            formData.set("subtitle", subtitle.trim());
            if (imageFile) {
              formData.set("image", imageFile);
            }
            if (removeExistingImage) {
              formData.set("removeImage", "1");
            }

            startTransition(async () => {
              setError(null);
              const result =
                isEdit && slide
                  ? await updateHeroSlideAction(locale, slide.id, formData)
                  : await createHeroSlideAction(locale, formData);

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
              <span className={ADMIN_LABEL}>{copy.hero.drawer.title}</span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
            </label>

            <label className="block">
              <span className={ADMIN_LABEL}>{copy.hero.drawer.subtitle}</span>
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
            </label>

            <div>
              <span className={ADMIN_LABEL}>{copy.hero.drawer.uploadImage}</span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
                >
                  {imagePreview
                    ? copy.hero.drawer.changeImage
                    : copy.hero.drawer.uploadImageButton}
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
                      if (isEdit && slide?.imageUrl) {
                        setRemoveExistingImage(true);
                      }
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-red-600"
                  >
                    {copy.hero.drawer.remove}
                  </button>
                ) : null}
              </div>
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- local blob/admin preview
                <img
                  src={imagePreview}
                  alt=""
                  className="mt-3 h-28 w-28 rounded-xl border border-gray-200 object-cover"
                />
              ) : null}
            </div>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>

          <div className="flex items-center gap-4 border-t border-gray-200 px-5 py-4">
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending
                ? isEdit
                  ? copy.common.saving
                  : copy.common.creating
                : isEdit
                  ? copy.hero.drawer.edit
                  : copy.hero.drawer.create}
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

'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { SideSheet } from '@/components/ui/SideSheet';
import { ADMIN_LABEL } from '@/features/admin/ui/admin-form-classes';
import {
  createCategoryFromDrawerAction,
  updateCategoryFromDrawerAction,
} from '@/features/categories/actions';
import type { AdminCategoryListItem } from '@/features/categories/application/list-admin-categories';
import {
  CategoryDrawerLocaleFields,
  categoryDraftsFrom,
  categoryHasTitle,
  collectCategoryTranslations,
  emptyCategoryDrafts,
  type CategoryLocaleDraft,
} from '@/features/categories/ui/CategoryDrawerLocaleFields';
import { isLocale, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

type DrawerCopy = {
  drawer: Dictionary['admin']['categories']['drawer'];
  common: Dictionary['admin']['common'];
};

type AddCategoryDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  categories: AdminCategoryListItem[];
  category?: AdminCategoryListItem | null;
  copy: DrawerCopy;
};

export function AddCategoryDrawer({
  locale,
  open,
  onClose,
  categories,
  category = null,
  copy,
}: AddCategoryDrawerProps) {
  const router = useRouter();
  const isEdit = category != null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>(isLocale(locale) ? locale : 'hy');
  const [drafts, setDrafts] = useState(emptyCategoryDrafts);
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    if (category) {
      setActiveLocale(isLocale(locale) ? locale : 'hy');
      setDrafts(categoryDraftsFrom(category.translations));
      setParentId(category.parentId ?? '');
      setStatus(category.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE');
      setImageFile(null);
      setImagePreview(category.imageUrl);
      setRemoveExistingImage(false);
      setError(null);
    } else {
      setActiveLocale(isLocale(locale) ? locale : 'hy');
      setDrafts(emptyCategoryDrafts());
      setParentId('');
      setStatus('ACTIVE');
      setImageFile(null);
      setImagePreview(null);
      setRemoveExistingImage(false);
      setError(null);
    }
  }, [open, category, locale]);

  const parentOptions = categories.filter((item) => item.id !== category?.id);

  function updateDraft(loc: Locale, patch: Partial<CategoryLocaleDraft>): void {
    setDrafts((current) => ({ ...current, [loc]: { ...current[loc], ...patch } }));
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.drawer.editAria : copy.drawer.addAria}
      variant="admin"
    >
      <div className="shrink-0 border-b-2 border-[#1e1e1e]/10 px-5 py-4 sm:px-6">
        <h2 className="font-display text-2xl leading-[0.95] text-[#1e1e1e] uppercase sm:text-3xl">
          {isEdit ? copy.drawer.editTitle : copy.drawer.addTitle}
        </h2>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const translations = collectCategoryTranslations(drafts);
          if (!translations) {
            setError(copy.common.atLeastOneLanguage);
            return;
          }

          const formData = new FormData();
          formData.set('translations', JSON.stringify(translations));
          formData.set('parentId', parentId);
          formData.set('status', status);
          if (imageFile) {
            formData.set('image', imageFile);
          }
          if (removeExistingImage) {
            formData.set('removeImage', '1');
          }

          startTransition(async () => {
            setError(null);
            const result =
              isEdit && category
                ? await updateCategoryFromDrawerAction(locale, category.id, formData)
                : await createCategoryFromDrawerAction(locale, formData);

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
          <CategoryDrawerLocaleFields
            active={activeLocale}
            drafts={drafts}
            disabled={isPending}
            onActiveChange={setActiveLocale}
            onDraftChange={updateDraft}
          />

          <div>
            <span className={ADMIN_LABEL}>{copy.drawer.parentCategory}</span>
            <SelectDropdown
              ariaLabel={copy.drawer.parentCategoryAria}
              value={parentId}
              allLabel={copy.drawer.noneRootCategory}
              options={parentOptions.map((item) => ({
                label: item.title,
                value: item.id,
              }))}
              disabled={isPending}
              deferChange={false}
              className="mt-1"
              onValueChange={setParentId}
            />
          </div>

          <div>
            <span className={ADMIN_LABEL}>{copy.drawer.status}</span>
            <SelectDropdown
              ariaLabel={copy.drawer.statusAria}
              value={status}
              options={[
                { label: copy.drawer.published, value: 'ACTIVE' },
                { label: copy.drawer.archived, value: 'ARCHIVED' },
              ]}
              disabled={isPending}
              deferChange={false}
              className="mt-1"
              onValueChange={(next) => setStatus(next as 'ACTIVE' | 'ARCHIVED')}
            />
          </div>

          <div>
            <span className={ADMIN_LABEL}>{copy.drawer.image}</span>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
              >
                {imagePreview ? copy.drawer.changeImage : copy.drawer.uploadImage}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  event.target.value = '';
                  setImagePreview((current) => {
                    if (current?.startsWith('blob:')) {
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
                      if (current?.startsWith('blob:')) {
                        URL.revokeObjectURL(current);
                      }
                      return null;
                    });
                    if (isEdit && category?.imageUrl) {
                      setRemoveExistingImage(true);
                    }
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-red-600"
                >
                  {copy.drawer.remove}
                </button>
              ) : null}
            </div>
            {imagePreview ? (
              // Blob or remote preview URLs are not always next/image-safe.
              // eslint-disable-next-line @next/next/no-img-element -- preview
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
          <Button type="submit" disabled={isPending || !categoryHasTitle(drafts)}>
            {isPending
              ? isEdit
                ? copy.common.saving
                : copy.common.creating
              : isEdit
                ? copy.common.save
                : copy.drawer.createCategory}
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
    </SideSheet>
  );
}

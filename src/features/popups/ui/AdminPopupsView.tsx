"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
  ADMIN_SECTION_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import type { AdminPopupListItem } from "@/features/popups/application/queries";
import { PopupControls } from "@/features/popups/ui/PopupControls";
import { PopupDrawer } from "@/features/popups/ui/PopupDrawer";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminPopupsViewProps = {
  locale: string;
  popups: AdminPopupListItem[];
  copy: Dictionary["admin"];
};

export function AdminPopupsView({
  locale,
  popups,
  copy,
}: AdminPopupsViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<AdminPopupListItem | null>(
    null,
  );

  function openCreate(): void {
    setEditingPopup(null);
    setDrawerOpen(true);
  }

  function openEdit(popup: AdminPopupListItem): void {
    setEditingPopup(popup);
    setDrawerOpen(true);
  }

  function closeDrawer(): void {
    setDrawerOpen(false);
    setEditingPopup(null);
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={ADMIN_PAGE_TITLE}>{copy.popups.title}</h1>
          <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>
            {popups.length === 1
              ? copy.popups.count.replace("{count}", "1")
              : copy.popups.countPlural.replace(
                  "{count}",
                  String(popups.length),
                )}
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          {copy.popups.createPopup}
        </Button>
      </div>

      <div className="mb-4">
        <h2 className={ADMIN_SECTION_TITLE}>
          {copy.popups.listHeading.replace("{count}", String(popups.length))}
        </h2>
      </div>

      <div className="space-y-3">
        {popups.map((popup) => (
          <Card key={popup.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 gap-3">
                {popup.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                  <img
                    src={popup.imageUrl}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                    {copy.popups.noImage}
                  </div>
                )}
                <div className="min-w-0">
                  <p>
                    <button
                      type="button"
                      onClick={() => openEdit(popup)}
                      className="text-left font-medium text-gray-900 hover:underline"
                    >
                      {popup.title}
                    </button>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`${ADMIN_BADGE} ${
                        popup.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {popup.isActive
                        ? copy.popups.active
                        : copy.popups.inactive}
                    </span>
                    {popup.linkUrl ? (
                      <span className="truncate text-xs text-gray-500">
                        {popup.linkUrl}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <PopupControls
                locale={locale}
                popupId={popup.id}
                popupTitle={popup.title}
                isActive={popup.isActive}
                onEdit={() => openEdit(popup)}
                copy={copy}
              />
            </div>
          </Card>
        ))}
        {popups.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-sm text-gray-600">
              {copy.popups.empty}
            </p>
          </Card>
        ) : null}
      </div>

      <PopupDrawer
        locale={locale}
        open={drawerOpen}
        onClose={closeDrawer}
        popup={editingPopup}
        copy={copy}
      />
    </section>
  );
}

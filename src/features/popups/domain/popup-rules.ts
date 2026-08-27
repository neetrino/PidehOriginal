export type PopupRuleError = "TITLE_REQUIRED" | "INVALID_LINK_URL";

const LINK_URL_PATTERN = /^(?:\/[A-Za-z0-9/_-]*)|(?:https?:\/\/.+)$/;

/** Validates popup title and optional click-through URL. */
export function validatePopupFields(input: {
  title: string;
  linkUrl?: string | null;
}): PopupRuleError | null {
  if (!input.title.trim()) {
    return "TITLE_REQUIRED";
  }

  const url = input.linkUrl?.trim() ?? "";
  if (url && !LINK_URL_PATTERN.test(url)) {
    return "INVALID_LINK_URL";
  }

  return null;
}

export function popupRuleErrorMessage(code: PopupRuleError): string {
  switch (code) {
    case "TITLE_REQUIRED":
      return "Title is required.";
    case "INVALID_LINK_URL":
      return "Link URL must be a site path or http(s) URL.";
  }
}

/**
 * Returns the set of popup IDs that must be deactivated when activating `targetId`.
 * Pure helper for the one-active invariant.
 */
export function popupIdsToDeactivate(
  popups: Array<{ id: string; isActive: boolean }>,
  targetId: string,
): string[] {
  return popups
    .filter((popup) => popup.isActive && popup.id !== targetId)
    .map((popup) => popup.id);
}

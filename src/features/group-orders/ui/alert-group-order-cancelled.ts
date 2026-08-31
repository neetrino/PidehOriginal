const ALERT_PREFIX = "pideh-group-order-cancelled:";

/** Shows the cancelled alert at most once per invite token in this tab. */
export function alertGroupOrderCancelledOnce(
  inviteToken: string,
  message: string,
): void {
  if (typeof window === "undefined") return;
  const key = `${ALERT_PREFIX}${inviteToken}`;
  try {
    if (window.sessionStorage.getItem(key) === "1") {
      return;
    }
    window.sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage may be unavailable; still alert.
  }
  window.alert(message);
}

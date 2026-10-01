const NOTICE_PREFIX = 'pideh-group-order-cancelled:';

/**
 * Returns true the first time this tab should explain that the group order
 * was cancelled. Later calls stay quiet so the notice is not repeated.
 */
export function claimGroupOrderCancelledNotice(inviteToken: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = `${NOTICE_PREFIX}${inviteToken}`;
  try {
    if (window.sessionStorage.getItem(key) === '1') return false;
    window.sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return true;
  }
}

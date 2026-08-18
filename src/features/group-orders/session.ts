import { cookies } from "next/headers";

/** Active group-order invite token cookie (storefront session). */
export const GROUP_ORDER_INVITE_COOKIE = "ws_group_order_invite";

/** Active participant id cookie for the current browser. */
export const GROUP_ORDER_PARTICIPANT_COOKIE = "ws_group_order_participant";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 48;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

export async function peekGroupOrderSession(): Promise<{
  inviteToken: string | null;
  participantId: string | null;
}> {
  const store = await cookies();
  return {
    inviteToken: store.get(GROUP_ORDER_INVITE_COOKIE)?.value ?? null,
    participantId: store.get(GROUP_ORDER_PARTICIPANT_COOKIE)?.value ?? null,
  };
}

export async function setGroupOrderSession(input: {
  inviteToken: string;
  participantId: string;
}): Promise<void> {
  const store = await cookies();
  store.set(GROUP_ORDER_INVITE_COOKIE, input.inviteToken, cookieOptions());
  store.set(
    GROUP_ORDER_PARTICIPANT_COOKIE,
    input.participantId,
    cookieOptions(),
  );
}

export async function clearGroupOrderSession(): Promise<void> {
  const store = await cookies();
  store.delete(GROUP_ORDER_INVITE_COOKIE);
  store.delete(GROUP_ORDER_PARTICIPANT_COOKIE);
}

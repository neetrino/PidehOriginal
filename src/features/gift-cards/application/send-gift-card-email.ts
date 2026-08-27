import { getProviders } from "@/config/providers";
import { formatMoneyAmount } from "@/lib/money/format";

export async function sendGiftCardEmail(input: {
  to: string;
  recipientName: string;
  purchaserName: string;
  code: string;
  amount: number;
  message: string | null;
  expiresAt: Date | null;
  locale?: string;
}): Promise<{ id: string }> {
  const amountLabel = formatMoneyAmount(
    input.amount,
    "AMD",
    input.locale ?? "hy",
  );
  const expiresLabel = input.expiresAt
    ? input.expiresAt.toISOString().slice(0, 10)
    : null;
  const messageBlock = input.message?.trim()
    ? `\n\nMessage from ${input.purchaserName}:\n${input.message.trim()}`
    : "";

  const text = [
    `Hello ${input.recipientName},`,
    "",
    `${input.purchaserName} sent you a Pideh gift card.`,
    `Value: ${amountLabel}`,
    `Code: ${input.code}`,
    expiresLabel ? `Expires: ${expiresLabel}` : null,
    messageBlock.trim() || null,
    "",
    "Use this code at checkout. Gift cards cannot be exchanged for cash.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Hello ${escapeHtml(input.recipientName)},</p>
    <p><strong>${escapeHtml(input.purchaserName)}</strong> sent you a Pideh gift card.</p>
    <p>Value: <strong>${escapeHtml(amountLabel)}</strong></p>
    <p>Code: <strong style="letter-spacing:0.08em">${escapeHtml(input.code)}</strong></p>
    ${expiresLabel ? `<p>Expires: ${escapeHtml(expiresLabel)}</p>` : ""}
    ${
      input.message?.trim()
        ? `<p>Message from ${escapeHtml(input.purchaserName)}:</p><blockquote>${escapeHtml(input.message.trim())}</blockquote>`
        : ""
    }
    <p>Use this code at checkout. Gift cards cannot be exchanged for cash.</p>
  `.trim();

  return getProviders().email.send({
    to: input.to,
    subject: `Your Pideh gift card — ${input.code}`,
    text,
    html,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

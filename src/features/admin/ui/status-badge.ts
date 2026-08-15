/** Status pill classes — Pideh kitchen-ops tones. */
export function orderStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "PENDING" || normalized === "CONFIRMED") {
    return "bg-[#ffd54a]/70 text-[#1e1e1e]";
  }
  if (normalized === "PROCESSING" || normalized === "SHIPPED") {
    return "bg-[#fff8e7] text-[#ff6b00] ring-1 ring-[#ff6b00]/25";
  }
  if (normalized === "DELIVERED") {
    return "bg-[#1e1e1e] text-white";
  }
  if (normalized === "CANCELLED" || normalized === "REFUNDED") {
    return "bg-[#ff6b00]/15 text-[#c2410c]";
  }
  return "bg-[#1e1e1e]/8 text-[#1e1e1e]";
}

export function paymentStatusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "PAID" || normalized === "CAPTURED") {
    return "bg-[#1e1e1e] text-white";
  }
  if (normalized === "PENDING" || normalized === "AUTHORIZED") {
    return "bg-[#ffd54a]/70 text-[#1e1e1e]";
  }
  if (
    normalized === "FAILED" ||
    normalized === "CANCELLED" ||
    normalized === "REFUNDED"
  ) {
    return "bg-[#ff6b00]/15 text-[#c2410c]";
  }
  return "bg-[#1e1e1e]/8 text-[#1e1e1e]";
}

export const ADMIN_BADGE =
  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold";

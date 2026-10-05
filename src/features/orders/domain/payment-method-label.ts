export type AdminPaymentMethodLabels = {
  cash: string;
  idram: string;
  arca: string;
  terminal: string;
  unknown: string;
};

/** Maps stored payments.method (COD / IDRAM / ARCA / TERMINAL) to admin UI copy. */
export function adminPaymentMethodLabel(
  method: string | null | undefined,
  labels: AdminPaymentMethodLabels,
): string {
  switch (method) {
    case 'COD':
    case 'CASH':
      return labels.cash;
    case 'IDRAM':
      return labels.idram;
    case 'ARCA':
      return labels.arca;
    case 'TERMINAL':
      return labels.terminal;
    default:
      return method && method.length > 0 ? method : labels.unknown;
  }
}

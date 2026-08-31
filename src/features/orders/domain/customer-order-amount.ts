/**
 * Amount shown on the customer profile for an order.
 * Group orders store the kitchen/admin grand total on `orders.totalAmount`;
 * the profile must show only this customer's participant share.
 */
export function resolveCustomerFacingOrderAmount(input: {
  orderTotalAmount: number;
  groupOrderId: string | null | undefined;
  participantFinalAmount: number | null | undefined;
}): number {
  if (
    input.groupOrderId &&
    input.participantFinalAmount != null &&
    Number.isFinite(input.participantFinalAmount)
  ) {
    return input.participantFinalAmount;
  }
  return input.orderTotalAmount;
}

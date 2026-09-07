/**
 * Profile order visibility: checkout owner, or ACTIVE group-order participant.
 * Application layer resolves ownership / participation from the database.
 */
export function canViewerSeeCustomerOrder(input: {
  isOrderOwner: boolean;
  isActiveGroupParticipant: boolean;
}): boolean {
  return input.isOrderOwner || input.isActiveGroupParticipant;
}

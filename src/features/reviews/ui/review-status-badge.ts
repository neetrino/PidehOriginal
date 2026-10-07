/** Tailwind classes for an admin review moderation status badge. */
export function reviewStatusBadgeClass(status: string): string {
  if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
  if (status === 'APPROVED') return 'bg-green-100 text-green-800';
  if (status === 'REJECTED') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

/**
 * City stored on addresses when the customer is not asked for one.
 *
 * The storefront only delivers inside a single city, so address forms omit the
 * field while the `addresses.city` column stays required.
 */
export const DEFAULT_DELIVERY_CITY = 'Yerevan';

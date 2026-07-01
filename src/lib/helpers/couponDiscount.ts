/**
 * Server-side coupon discount calculation.
 *
 * SECURITY: never trust a `discountAmount` sent by the client. Always recompute
 * the discount here from the persisted coupon record against the server-calculated
 * items total, then feed the result into the order total validation.
 */
export interface CouponForDiscount {
  discountType: string; // "percentage" | "fixed"
  discountValue: number;
  minOrderAmount?: number | null;
}

export function computeCouponDiscount(
  coupon: CouponForDiscount | null | undefined,
  itemsTotal: number
): number {
  if (!coupon) return 0;

  // Honour the minimum-order threshold (no discount if not met)
  if (coupon.minOrderAmount && itemsTotal < coupon.minOrderAmount) return 0;

  const discount =
    coupon.discountType === "percentage"
      ? (itemsTotal * coupon.discountValue) / 100
      : coupon.discountValue;

  // Clamp between 0 and the items total
  return Math.min(Math.max(discount, 0), itemsTotal);
}

import type { CartLineItem } from "../services/salesforceApi";

export function isPrimaryCartLine(line: CartLineItem): boolean {
  return !line.isChild && line.quantity !== null && line.quantity > 0;
}

export function getCartItemCount(lineItems: CartLineItem[]): number {
  return lineItems.reduce((sum, line) => {
    // TODO: Align null-quantity handling with salesforceApi cart totals (count root null quantity as 1).
    if (!isPrimaryCartLine(line)) {
      return sum;
    }
    return sum + (line.quantity ?? 0);
  }, 0);
}

import type { Product, QuantityOption } from '../types';

/**
 * FIX: Bug 1 - Utility function to check if a product and/or variant is available.
 * 
 * Returns false if:
 * - product.status != 'active' (when status is defined)
 * - product.available === false OR product.out_of_stock === true
 * - product.stock_quantity === 0 OR product.stock <= 0
 * - variant.stock <= 0 OR variant.out_of_stock === true
 * - variant.isFrozen === true but not allowed for sidebar order (when isSidebar === true)
 */
export function isProductAvailable(
  product: Product | any,
  variant?: QuantityOption | any,
  isSidebar: boolean = false
): boolean {
  if (!product) return false;

  // If 2nd parameter passed is boolean, treat as isSidebar
  if (typeof variant === 'boolean') {
    isSidebar = variant;
    variant = undefined;
  }

  // FIX: Bug 1: Check product status (if provided, must be 'active')
  if (product.status !== undefined && product.status !== 'active') {
    return false;
  }

  // FIX: Bug 1: Check out_of_stock flag and available flag
  if (product.available === false || product.out_of_stock === true) {
    return false;
  }

  // FIX: Bug 1: Check numeric stock if explicitly 0
  if (typeof product.stock === 'number' && product.stock <= 0) {
    return false;
  }
  if (typeof product.stock_quantity === 'number' && product.stock_quantity === 0) {
    return false;
  }

  // Frozen & sidebar checks
  const isFrozen = Boolean(
    variant?.isFrozen ?? product.isFrozen ?? (product.category === 'Frozen Items')
  );
  const allowSidebarOrder = Boolean(
    variant?.allowSidebarOrder ?? product.allowSidebarOrder
  );

  // FIX: Bug 1: Frozen items only allowed in sidebar if allowSidebarOrder is true
  if (isSidebar && isFrozen && !allowSidebarOrder) {
    return false;
  }

  // FIX: Bug 1: If specific variant passed, validate its stock and flags
  if (variant && typeof variant === 'object') {
    if (variant.out_of_stock === true) {
      return false;
    }
    if (typeof variant.stock === 'number' && variant.stock <= 0) {
      return false;
    }
    if (typeof variant.stock_quantity === 'number' && variant.stock_quantity === 0) {
      return false;
    }
    if (isSidebar && isFrozen && !allowSidebarOrder) {
      return false;
    }
    return true;
  }

  // FIX: Bug 1: If no specific variant passed, verify if product has variants and at least one is available
  if (product.quantityOptions && Array.isArray(product.quantityOptions) && product.quantityOptions.length > 0) {
    const hasAnyAvailableVariant = product.quantityOptions.some((opt: any) =>
      isProductAvailable(product, opt, isSidebar)
    );
    if (!hasAnyAvailableVariant) {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// FIX BUG 2: getVariantPrice — dynamic price calculation for lb-based cakes
// ---------------------------------------------------------------------------
/**
 * Returns the correct price for a given product + variant selection.
 *
 * Rule for Cakes:
 *   If product.category === 'Cakes' AND variantName contains 'lb'
 *   → extract the multiplier (e.g. "2 lb" = 2) and return base_1lb_price * multiplier.
 *   This lets us store only the 1lb price in DB and auto-calculate all others.
 *
 * For all other products (Biscuits, Cookies, etc.):
 *   → just return the stored variant.price as-is.
 *
 * @param product   The full Product object
 * @param variant   A QuantityOption object OR a variant name/label string
 * @returns         The correct price as a number
 */
export function getVariantPrice(
  product: Product | any,
  variant?: QuantityOption | any | string
): number {
  if (!product) return 0;

  // Normalise variant to an object shape
  const variantObj: QuantityOption | any | undefined =
    typeof variant === 'string'
      ? product.quantityOptions?.find(
          (o: QuantityOption) => o.label === variant || o.value === variant
        )
      : variant;

  const variantLabel: string =
    (variantObj?.label ?? variantObj?.value ?? (typeof variant === 'string' ? variant : '')) as string;

  // FIX BUG 2: Cakes with lb-based variants → dynamic calculation
  if (product.category === 'Cakes' && /lb/i.test(variantLabel)) {
    // Parse multiplier from variant label, e.g. "2 lb" → 2, "1LB" → 1
    const match = variantLabel.match(/(\d+(?:\.\d+)?)\s*lb/i);
    if (match) {
      const multiplier = parseFloat(match[1]);

      // Find the 1lb base price from quantityOptions
      const base1lbOpt = product.quantityOptions?.find(
        (o: QuantityOption) =>
          /^1\s*lb$/i.test(o.label ?? '') || /^1\s*lb$/i.test(o.value ?? '')
      );
      const base1lbPrice: number = base1lbOpt?.price ?? product.price ?? 0;

      // FIX BUG 2: exact multiplication — e.g. 600 * 2 = 1200
      return Math.round(base1lbPrice * multiplier);
    }
  }

  // FIX BUG 1: For all other products/variants, return stored variant price
  if (typeof variantObj?.price === 'number') return variantObj.price;

  // Final fallback to product base price
  return product.price ?? 0;
}

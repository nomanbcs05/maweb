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
export const KG_CATEGORIES = ['Khaaray', 'Biscuits', 'Rusks', 'Sugar Free Biscuits', 'Rusk Cakes', 'Rusk Cake'];

/**
 * Calculates proportional price for grams given price per KG.
 * Formula: Math.round((kgPrice / 1000) * grams)
 */
export const calculateGramPrice = (kgPrice: number, grams: number): number => {
  return Math.round((kgPrice / 1000) * grams);
};

/**
 * Auto-generates standard 250g, 500g, 1kg variants from base KG price.
 */
export const generateKgVariants = (kgPrice: number) => {
  return [
    { label: '250g', value: '250g', price: calculateGramPrice(kgPrice, 250) },
    { label: '500g', value: '500g', price: calculateGramPrice(kgPrice, 500) },
    { label: '1kg', value: '1kg', price: kgPrice }
  ];
};

/**
 * Checks if a product or category qualifies for KG auto-variant generation.
 */
export const isKgCategory = (categoryOrName: string, unit?: string): boolean => {
  if (unit && unit.toLowerCase() === 'kg') return true;
  if (!categoryOrName) return false;
  return KG_CATEGORIES.some(
    cat => cat.toLowerCase() === categoryOrName.toLowerCase() || categoryOrName.toLowerCase().includes(cat.toLowerCase())
  );
};

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

  // STEP 2: KG to Grams Auto calculation for KG items
  if (isKgCategory(product.category, product.unit) || isKgCategory(product.name, product.unit)) {
    const gramMatch = variantLabel.match(/^(\d+)\s*g$/i);
    if (gramMatch) {
      const grams = parseInt(gramMatch[1], 10);
      return calculateGramPrice(product.price, grams);
    }
    if (/^1\s*kg$/i.test(variantLabel)) {
      return product.price;
    }
  }

  // FIX BUG 1: For all other products/variants, return stored variant price
  if (typeof variantObj?.price === 'number') return variantObj.price;

  // Final fallback to product base price
  return product.price ?? 0;
}

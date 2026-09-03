// src/lib/utils.ts - Utility functions for M.A Bakers

export const KG_CATEGORIES = ['Khaaray', 'Biscuits', 'Rusks', 'Sugar Free Biscuits', 'Rusk Cakes'];

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
  return KG_CATEGORIES.some(
    cat => cat.toLowerCase() === categoryOrName.toLowerCase()
  );
};

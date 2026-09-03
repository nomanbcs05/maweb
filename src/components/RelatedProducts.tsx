import React from 'react';
import type { Product, QuantityOption } from '../types';
import { ProductCard } from './ProductCard';
import { isProductAvailable } from '../utils/product';

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  onAddToCart: (product: Product, quantity: number, notes?: string, selectedOption?: QuantityOption) => void;
  onQuickView: (product: Product) => void;
}

// FIX: Bug 1: Related products component filtering out of stock items
export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProduct,
  allProducts,
  onAddToCart,
  onQuickView,
}) => {
  const related = allProducts
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category && isProductAvailable(p))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-8 border-t border-stone-200 dark:border-zinc-800 pt-6">
      <h3 className="font-family-fraunces text-xl font-bold text-stone-900 dark:text-white mb-4">
        Related Products
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map(prod => (
          <ProductCard
            key={prod.id}
            product={prod}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </div>
  );
};

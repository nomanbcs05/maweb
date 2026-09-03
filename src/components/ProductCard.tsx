import React, { useState } from 'react';
import type { Product, QuantityOption } from '../types';
import { isProductAvailable, getVariantPrice, generateKgVariants, isKgCategory } from '../utils/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (
    product: Product,
    quantity: number,
    notes?: string,
    selectedOption?: QuantityOption,
    customPrice?: number
  ) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const isCake = product.category === 'Cakes';
  
  // STEP 2: Auto-create 250g/500g/1kg variants for KG categories if not manually provided
  const availableOptions: QuantityOption[] = (product.quantityOptions && product.quantityOptions.length > 0)
    ? product.quantityOptions
    : (isKgCategory(product.category, product.unit) || isKgCategory(product.name, product.unit))
      ? generateKgVariants(product.price)
      : [];

  // FIX BUG 1: Default to first available option or first option
  const initialOption = availableOptions.find(opt => isProductAvailable(product, opt)) || availableOptions[0];
  const [selectedOption, setSelectedOption] = useState<QuantityOption | undefined>(initialOption);
  
  // FIX BUG 1: Check if product and currently selected option are available
  const isAvailable = isProductAvailable(product, selectedOption);

  // FIX BUG 2: Use getVariantPrice to get the correct price (auto-calculates lb-based cakes)
  const displayPrice = getVariantPrice(product, selectedOption);
  
  return (
    <div className="group bg-white rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border-0 relative">
      
      {/* Product Image Panel */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative aspect-[3/4] overflow-hidden bg-white cursor-pointer"
        title="Click to view details & customize"
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* FIX BUG 1: Out of stock badge if product or option is not available */}
        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-rose-700 text-white px-2 py-1 rounded text-xs font-semibold uppercase">
            Out of Stock
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex flex-col flex-1 text-center">
        <h3 
          onClick={() => onQuickView(product)}
          className="text-lg font-semibold text-stone-800 mb-2 leading-tight cursor-pointer hover:text-rose-700 transition-colors"
          title="Click to customize"
        >
          {product.name}
        </h3>
        
        {/* FIX BUG 1 & BUG 2: Price uses getVariantPrice (variant price for non-cakes, dynamic lb calc for cakes) */}
        <p className="text-base font-bold text-rose-700 mb-3">
          Rs. {displayPrice}
        </p>
        
        <p className="text-xs text-stone-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Quantity Options */}
        {availableOptions.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap justify-center">
            {availableOptions.map((option) => {
              const optAvailable = isProductAvailable(product, option);
              return (
                <button
                  key={option.value}
                  onClick={() => optAvailable && setSelectedOption(option)}
                  disabled={!optAvailable}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    selectedOption?.value === option.value
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-white text-rose-700 border-rose-300 hover:border-rose-500'
                  } ${!optAvailable ? 'cursor-not-allowed opacity-40 line-through' : ''}`}
                  title={!optAvailable ? 'Out of stock' : option.label}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Add Button */}
        {/* FIX BUG 1: Disable and mark Out of Stock if not available */}
        <button 
          onClick={() => isAvailable && (isCake ? onQuickView(product) : onAddToCart(product, 1, '', selectedOption, displayPrice))}
          disabled={!isAvailable}
          className={`w-full py-3 font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
            isAvailable 
              ? 'bg-amber-400 hover:bg-amber-500 text-stone-900' 
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
        >
          {!isAvailable ? 'Out of Stock' : isCake ? 'Customize' : 'Add'}
        </button>
      </div>
    </div>
  );
};
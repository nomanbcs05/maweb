import React, { useState, useEffect, useMemo } from 'react';
import type { Product, QuantityOption } from '../types';
import { isProductAvailable, getVariantPrice } from '../utils/product';

// Product Card - Qty Logic - 100% Correct
const getProductOptions = (product: any): string[] => {
  // Agar DB me variants save hain to wahi dikhao - sabse best tareeqa
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((v: any) => typeof v === 'string' ? v : (v.label || v.value || v.name || String(v)));
  }

  // Agar DB me unitOptions save hain
  if (product.unitOptions && Array.isArray(product.unitOptions) && product.unitOptions.length > 0) {
    return product.unitOptions.map((v: any) => typeof v === 'string' ? v : (v.label || v.value || v.name || String(v)));
  }

  // Fallback - naam se pehchan
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();

  if (
    name.includes('three milk') ||
    name.includes('khaaray') ||
    name.includes('biscuit') ||
    name.includes('rusk') ||
    name.includes('rusk cake')
  ) {
    return ['250g', '500g', '1kg'];
  }
  if (name.includes('paratha 5pc')) return ['5 PC'];
  if (name.includes('paratha 30pc')) return ['30 PC'];
  if (name.includes('pita')) return ['1 PKT'];

  const pcMatch = name.match(/(\d+)\s*pc/);
  if (pcMatch) return [`${pcMatch[1]} PC`];

  if (
    (category === 'cakes' || name.includes('cake')) &&
    !name.includes('pastry') &&
    !name.includes('cupcake') &&
    !name.includes('slice')
  ) {
    return ['1LB', '2LB'];
  }

  // Pastries, Patties, Breads, Buns, Cupcakes etc
  return ['1 PC'];
};

// Helper to compute exact variant price for display
const computeOptionPrice = (product: Product, opt: string): number => {
  if (/(\d+(?:\.\d+)?)\s*lb/i.test(opt)) {
    const match = opt.match(/(\d+(?:\.\d+)?)\s*lb/i);
    const mult = match ? parseFloat(match[1]) : 1;
    const base1lbOpt = product.quantityOptions?.find(
      (o: QuantityOption) => /^1\s*lb$/i.test(o.label ?? '') || /^1\s*lb$/i.test(o.value ?? '')
    );
    const basePrice = base1lbOpt?.price ?? product.price ?? 0;
    return Math.round(basePrice * mult);
  }
  if (/(\d+)\s*g$/i.test(opt)) {
    const match = opt.match(/(\d+)\s*g$/i);
    const grams = match ? parseInt(match[1], 10) : 1000;
    return Math.round(((product.price ?? 0) / 1000) * grams);
  }
  if (/^1\s*kg$/i.test(opt)) {
    return product.price ?? 0;
  }
  return getVariantPrice(product, opt);
};

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
  const options = getProductOptions(product);

  const [selectedOption, setSelectedOption] = useState<string>(() => {
    return options[0] || '1 PC';
  });

  useEffect(() => {
    if (!options.includes(selectedOption)) {
      setSelectedOption(options[0] || '1 PC');
    }
  }, [product.id, product.name]);

  const displayPrice = computeOptionPrice(product, selectedOption);

  const selectedOptionObj: QuantityOption = useMemo(() => {
    const existing = product.quantityOptions?.find(
      (o: any) => o.label?.toLowerCase() === selectedOption.toLowerCase() || o.value?.toLowerCase() === selectedOption.toLowerCase()
    );
    if (existing) {
      return {
        ...existing,
        price: displayPrice
      };
    }
    return {
      label: selectedOption,
      value: selectedOption.toLowerCase().replace(/\s+/g, ''),
      price: displayPrice
    };
  }, [product, selectedOption, displayPrice]);

  const isAvailable = isProductAvailable(product, selectedOptionObj);

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
        
        {/* Price */}
        <p className="text-base font-bold text-rose-700 mb-3">
          Rs. {displayPrice}
        </p>
        
        <p className="text-xs text-stone-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Quantity Options */}
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => isAvailable && setSelectedOption(opt)}
              disabled={!isAvailable}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedOption === opt
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-white text-rose-700 border-rose-300 hover:border-rose-500'
              } ${!isAvailable ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Add Button */}
        <button 
          onClick={() => isAvailable && (isCake ? onQuickView(product) : onAddToCart(product, 1, '', selectedOptionObj, displayPrice))}
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
import React, { useState } from 'react';
import type { Product, QuantityOption } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, notes?: string, selectedOption?: QuantityOption) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const isCake = product.category === 'Cakes';
  const [selectedOption, setSelectedOption] = useState<QuantityOption>(product.quantityOptions[0]);
  
  const minPrice = Math.min(...product.quantityOptions.map(opt => opt.price));
  
  return (
    <div className="group bg-white rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border-0 relative">
      
      {/* Product Image Panel */}
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {!product.available && (
          <div className="absolute top-2 right-2 bg-rose-700 text-white px-2 py-1 rounded text-xs font-semibold uppercase">
            Not Available
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex flex-col flex-1 text-center">
        <h3 className="text-lg font-semibold text-stone-800 mb-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Price */}
        <p className="text-base font-bold text-rose-700 mb-3">
          FROM Rs. {minPrice}
        </p>
        
        <p className="text-xs text-stone-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Quantity Options */}
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {product.quantityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => product.available && setSelectedOption(option)}
              disabled={!product.available}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                selectedOption.value === option.value
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-white text-rose-700 border-rose-300 hover:border-rose-500'
              } ${!product.available ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Add Button */}
        <button 
          onClick={() => product.available && (isCake ? onQuickView(product) : onAddToCart(product, 1, '', selectedOption))}
          disabled={!product.available}
          className={`w-full py-3 font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
            product.available 
              ? 'bg-amber-400 hover:bg-amber-500 text-stone-900' 
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
        >
          {!product.available ? 'Not Available' : isCake ? 'Customize' : 'Add'}
        </button>
      </div>
    </div>
  );
};
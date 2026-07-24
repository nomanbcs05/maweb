import React, { useState } from 'react';
import type { Product, QuantityOption } from '../types';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ProductCustomizerModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes: string, selectedOption?: QuantityOption) => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedOption, setSelectedOption] = useState<QuantityOption | undefined>(undefined);

  if (!product) return null;

  // Initialize selected option if available
  React.useEffect(() => {
    if (product.quantityOptions && product.quantityOptions.length > 0) {
      setSelectedOption(product.quantityOptions[0]);
    }
  }, [product]);

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const currentPrice = selectedOption?.price || product.price;

  const handleAdd = () => {
    onAddToCart(product, quantity, notes, selectedOption);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* Modal Card container */}
      <div className="bg-white dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800/60 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col sm:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-zinc-950/80 hover:bg-stone-100 dark:hover:bg-zinc-850 rounded-full border border-stone-200/50 dark:border-zinc-800/50 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Product Image section */}
        <div className="w-full sm:w-1/2 bg-stone-100 dark:bg-zinc-800 h-64 sm:h-auto relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Customization Details form */}
        <div className="w-full sm:w-1/2 p-6 flex flex-col max-h-[60vh] sm:max-h-none overflow-y-auto">
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1.5 block">
              {product.category}
            </span>
            <h2 className="font-family-fraunces text-2xl font-bold text-stone-900 dark:text-white mb-2">
              {product.name}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
              {product.description}
            </p>
            
            {/* Quantity Options */}
            {product.quantityOptions && product.quantityOptions.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.quantityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedOption(option)}
                      className={`px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                        selectedOption?.value === option.value
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-rose-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price label */}
            <div className="mb-6">
              <span className="text-xs text-stone-400 dark:text-stone-500 block mb-1">Unit Price</span>
              <span className="text-xl font-bold text-stone-900 dark:text-white">
                Rs. {currentPrice.toFixed(0)}
              </span>
            </div>

            {/* Special Instructions textarea */}
            <div className="mb-6">
              <label 
                htmlFor="instructions"
                className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-2"
              >
                Special Instructions
              </label>
              <textarea
                id="instructions"
                rows={3}
                placeholder="e.g. Happy Birthday message, less frosting, sugar-free"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-3 text-sm border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-white outline-none focus:border-amber-600 dark:focus:border-amber-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Stepper & Add to Cart footer actions */}
          <div className="pt-4 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between gap-4 mt-auto">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-50 dark:bg-zinc-950 p-1.5">
              <button 
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold transition-all cursor-pointer active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-bold text-sm text-stone-900 dark:text-white">
                {quantity}
              </span>
              <button 
                onClick={handleIncrement}
                className="w-8 h-8 rounded-lg hover:bg-stone-200 dark:hover:bg-zinc-800 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold transition-all cursor-pointer active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart button */}
            <button 
              onClick={handleAdd}
              className="flex-1 px-5 py-3 bg-stone-900 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <ShoppingBag size={16} />
              Add — Rs. {(currentPrice * quantity).toFixed(0)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
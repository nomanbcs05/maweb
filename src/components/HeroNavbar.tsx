import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, ShoppingCart, X } from 'lucide-react';
import type { Product } from '../types';

interface HeroNavbarProps {
  categories: { id: string; name: string; slug: string }[];
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
  onOpenLocationModal: () => void;
  onOpenCart: () => void;
  cartCount?: number;
}

export const HeroNavbar: React.FC<HeroNavbarProps> = ({
  categories,
  products,
  onSelectCategory,
  onOpenLocationModal,
  onOpenCart,
  cartCount = 0,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
    onSelectCategory(categoryName);
  };

  return (
    <>
      <header className="relative z-50 w-full bg-[#071326]">
        {/* Gold accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A227]/70 to-transparent" />

        {/* Corner ornaments */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-12 w-12 border-l border-t border-[#C9A227]/25" />
          <div className="absolute right-0 top-0 h-12 w-12 border-r border-t border-[#C9A227]/25" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-[52px] items-center justify-between sm:h-[60px] lg:h-[68px]">
            {/* Left */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur-md transition-all duration-300 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 hover:text-[#C9A227]"
                aria-label="Open menu"
              >
                <Menu size={16} strokeWidth={1.5} />
              </button>

              <div className="hidden h-5 w-px bg-white/15 sm:block" />

              <a
                href="https://wa.me/923093660360"
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden items-center gap-2.5 text-white transition-colors sm:flex"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors group-hover:border-[#C9A227]/40 group-hover:bg-[#C9A227]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors group-hover:text-[#C9A227]">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 transition-colors group-hover:text-[#C9A227]">
                  Call Us
                </span>
              </a>
            </div>

            {/* Center logo */}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            >
              <img
                src="/images/ma-bakers-white-logo.png"
                alt="M.A BAKERS"
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain drop-shadow-[0_2px_12px_rgba(201,162,39,0.25)] filter invert brightness-200"
              />
            </button>

            {/* Right */}
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="hidden max-w-[200px] truncate text-right text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/80 transition-colors hover:text-[#C9A227] md:block lg:max-w-none"
              >
                How you&apos;d like to receive your order
              </button>

              <button
                type="button"
                onClick={onOpenLocationModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur-md transition-all duration-300 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 hover:text-[#C9A227] md:hidden"
                aria-label="Order delivery options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>

              <button
                type="button"
                onClick={onOpenCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur-md transition-all duration-300 hover:border-[#C9A227]/40 hover:bg-[#C9A227]/10 hover:text-[#C9A227]"
                aria-label="Open cart"
              >
                <ShoppingCart size={18} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] text-[10px] font-bold text-[#05070c]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </header>

      {/* Category sidebar */}
      {sidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <aside className="fixed left-0 top-0 z-[70] flex h-full w-[min(22rem,88vw)] flex-col border-r border-[#071326]/10 bg-[#f4ead6] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="mb-8 flex items-center justify-between">
              <img
                src="/images/ma-bakers-logo.png"
                alt="M.A BAKERS"
                className="h-12 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-full border border-[#071326]/10 bg-white/50 p-2 text-[#071326] transition-colors hover:bg-white/80"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#071326]/80">
              Categories
            </h2>

            <div className="flex-1 space-y-2 overflow-y-auto pr-2">
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium capitalize text-[#071326]/85 transition-all hover:bg-white/60 hover:text-[#071326]"
                  >
                    <span>{category.name.toLowerCase()}</span>
                    {expandedCategoryId === category.id ? (
                      <ChevronDown size={16} className="text-[#071326]/50" />
                    ) : (
                      <ChevronRight size={16} className="text-[#071326]/50" />
                    )}
                  </button>
                  {expandedCategoryId === category.id && (
                    <div className="space-y-2 border-l border-[#071326]/10 pl-3">
                      {products
                        .filter((product) => product.category === category.name)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 rounded-lg bg-white/60 p-2.5 text-[#071326]/80"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold">{product.name}</h4>
                              <p className="text-xs text-[#C9A227]">Rs. {product.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </>
      )}
    </>
  );
};

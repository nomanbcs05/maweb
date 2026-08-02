import { useState, useEffect } from 'react';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTracking } from './components/OrderTracking';
import { AdminPanel } from './components/AdminPanel';
import { ProductCustomizerModal } from './components/ProductCustomizerModal';
import { OrderTypeLocationModal } from './components/OrderTypeLocationModal';
import { HeroSlider } from './components/HeroSlider';
import { HeroNavbar } from './components/HeroNavbar';
import { LoadingScreen } from './components/LoadingScreen';
import type { Product, Order } from './types';
import { API } from './services/api';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Flame,
  ChevronRight,
  CakeSlice,
  Package,
  Clock,
} from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [route, setRoute] = useState<'store' | 'admin' | 'track'>('store');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showBestSellers, setShowBestSellers] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(false);
  const [, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    fetchData();
    const savedCart = localStorage.getItem('mab_cart_react');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)) } catch {}
    }
    const savedLocation = localStorage.getItem('order_location');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
  }, []);

  // Immediately show modal once loading is complete
  useEffect(() => {
    if (!isLoading) {
      setIsOrderTypeModalOpen(true);
    }
  }, [isLoading]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [prodData, catData] = await Promise.all([API.getProducts(), API.getCategories()]);
      setProducts(prodData);
      setCategories(catData);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setDataLoading(false);
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('mab_cart_react', JSON.stringify(newCart));
  };

  const handleOrderTypeSelect = (type: 'delivery' | 'pickup', location: any) => {
    const locValue = typeof location === 'string' ? location : location?.name || '';
    setSelectedLocation(locValue);
    localStorage.setItem('order_type', type);
    localStorage.setItem('order_location', locValue);
  };

  const handleAddToCart = (product: Product, quantity: number, notes = '', selectedOption?: any) => {
    const existing = cart.find(
      i => i.product.id === product.id && 
           i.notes === notes && 
           i.selectedOption?.value === selectedOption?.value
    );
    let newCart = [...cart];
    if (existing) {
      existing.quantity += quantity;
    } else {
      newCart.push({ product, quantity, notes, selectedOption });
    }
    saveCart(newCart);
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, delta: number, optionValue?: string) => {
    const newCart = cart.map(item => {
      if (item.product.id === productId && item.selectedOption?.value === optionValue) {
        const next = item.quantity + delta;
        return next > 0 ? { ...item, quantity: next } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(newCart);
  };

  const handleUpdateNotes = (productId: string, notes: string, optionValue?: string) => {
    saveCart(cart.map(i => 
      i.product.id === productId && i.selectedOption?.value === optionValue 
        ? { ...i, notes } 
        : i
    ));
  };

  const handleRemove = (productId: string, optionValue?: string) => {
    saveCart(cart.filter(
      i => !(i.product.id === productId && i.selectedOption?.value === optionValue)
    ));
  };

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredProducts = products.filter(p => {
    // Still show unavailable items but mark them as not available
    const searchLower = search.toLowerCase().trim();
    
    // Search across multiple product fields
    const matchSearch = !searchLower || 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
      (p.ingredients && p.ingredients.some(ing => ing.toLowerCase().includes(searchLower))) ||
      (p.allergens && p.allergens.some(allergen => allergen.toLowerCase().includes(searchLower))) ||
      (p.unit && p.unit.toLowerCase().includes(searchLower));
      
    const matchCat =
      activeCategory === 'all' ||
      (activeCategory === 'Cupcakes' && (p.slug === 'cupcakes' || p.name === 'Cupcakes')) ||
      (activeCategory === 'Tea Time Munchies' && p.category === 'Cookies') ||
      p.category === activeCategory;
    const matchBest = !showBestSellers || p.best_seller;
    const matchNew = !showNewArrivals || p.new_arrival;
    return matchSearch && matchCat && matchBest && matchNew;
  });

  const featuredProducts = products.filter(p => p.featured);

  const handleHeroCategorySelect = (categoryName: string) => {
    setSearch('');
    setShowBestSellers(false);
    setShowNewArrivals(false);
    setActiveCategory(categoryName);
    window.setTimeout(() => {
      scrollToCatalog();
    }, 50);
  };

  if (route === 'admin') {
    return <AdminPanel onBackToStore={() => { setRoute('store'); fetchData(); }} />;
  }

  if (route === 'track') {
    return <OrderTracking onBackToStore={() => setRoute('store')} />;
  }

  return (
    <>
      <LoadingScreen onComplete={() => setIsLoading(false)} />
      {!isLoading && (
        <div className="min-h-screen bg-white text-[#071326] transition-colors duration-300 overflow-x-hidden w-full max-w-full relative">

          {/* Floating WhatsApp Button */}
          <a 
            href="https://wa.me/03297040402" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed right-4 bottom-6 sm:right-6 sm:bottom-8 z-40 bg-green-500 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl flex items-center justify-center hover:bg-green-600 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Contact us on WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .162 5.333.162 11.889c0 2.109.557 4.138 1.596 5.933L.05 24l6.269-1.643a11.833 11.833 0 005.728 1.464h.003c6.555 0 11.887-5.333 11.887-11.888A11.815 11.815 0 0020.88 3.488"/>
            </svg>
          </a>

          {/* PREMIUM NAVBAR + HERO */}
          <HeroNavbar
            categories={categories.filter((cat) => !['salad', 'snack', 'snacks'].includes(cat.name.toLowerCase()))}
            onOpenLocationModal={() => setIsOrderTypeModalOpen(true)}
            onSelectCategory={handleHeroCategorySelect}
            products={products}
            onOpenCart={() => setIsCartOpen(true)}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          />
          <HeroSlider />

          {/* PROFESSIONAL CATEGORY BAR (right after hero) */}
          <section className="sticky top-0 z-20 border-b border-[#071326]/10 bg-[#f4ead6] shadow-md w-full">
            <div className="mx-auto flex max-w-7xl items-center justify-start md:justify-center gap-4 sm:gap-8 px-4 sm:px-6 py-3.5 overflow-x-auto scrollbar-none scroll-smooth">
              {['Cakes', 'Cupcakes', 'Breads', 'Pastries', 'Frozen Items', 'Tea Time Munchies'].map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => handleHeroCategorySelect(catName)}
                  className={`shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] transition-all px-2 py-1 ${
                    activeCategory === catName ? 'text-[#C9A227]' : 'text-[#071326]/70 hover:text-[#C9A227]'
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          </section>

          {/* SEARCH BAR */}
          <section className="border-b border-[#071326]/10 bg-white py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="relative">
                <Search size={16} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#071326]/45" />
                <input
                  type="text"
                  placeholder="Search for cakes, breads, pastries and more..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-full border border-[#C9A227]/35 bg-white py-3 sm:py-4 pl-11 sm:pl-12 pr-4 text-xs sm:text-sm text-[#071326] outline-none transition-colors placeholder:text-[#071326]/40 focus:border-[#C9A227]"
                />
              </div>
            </div>
          </section>

          {/* FEATURED SELECTIONS */}
          {featuredProducts.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-12 sm:pb-16">
              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <Sparkles size={20} className="text-[#C9A227]" />
                  <h2 className="font-bold text-lg sm:text-xl text-[#071326]" style={{ fontFamily: 'Fraunces, serif' }}>
                    Featured Selections
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#071326]/60">
                  Signature bakery picks loved most by our customers.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p}
                    onAddToCart={(prod, qty, notes) => {
                      if (prod.category === 'Cakes') setCustomizingProduct(prod);
                      else handleAddToCart(prod, qty, notes || '');
                    }}
                    onQuickView={setCustomizingProduct}
                  />
                ))}
              </div>
            </section>
          )}

          {/* CATEGORY SECTIONS */}
          {!search && activeCategory === 'all' && !showBestSellers && !showNewArrivals && (
            <section className="pb-16 sm:pb-24">
              {(() => {
                // Order categories with "Cakes" first
                const orderedCategories = [
                  ...categories.filter(c => c.name === 'Cakes'),
                  ...categories.filter(c => c.name !== 'Cakes')
                ];
                
                // Category metadata for professional look
                const categoryMeta: Record<string, {
          description: string;
          image: string;
          subtitle: string;
        }> = {
          'Cakes': {
            description: 'Indulge in our handcrafted cakes, baked fresh daily with premium ingredients. From rich chocolate cakes to light fruit gateaux, every slice tells a story of passion and perfection.',
            image: 'https://images.unsplash.com/photo-1505250469679-6c5e6a47f5ca?w=1400&q=80&auto=format&fit=crop',
            subtitle: 'Celebrate Every Moment'
          },
          'Pastries': {
            description: 'Experience buttery, flaky perfection with our artisan pastries. Each piece is crafted with love, using traditional techniques passed down through generations.',
            image: 'https://images.unsplash.com/photo-1528744598421-b7c8b79ca0f4?w=1400&q=80&auto=format&fit=crop',
            subtitle: 'Buttery & Delicate'
          },
          'Breads': {
            description: 'Discover the art of slow fermentation with our artisan breads. From crusty sourdough to soft dinner rolls, each loaf is a testament to timeless baking.',
            image: '/placeholder_images/generic_placeholder.jpg',
            subtitle: 'Slow-Fermented Perfection'
          },
          'Cookies': {
            description: 'Crunchy, chewy, and absolutely irresistible. Our cookies are baked to golden perfection using the finest chocolates and nuts.',
            image: '/images/products/cookies/biscuits.png',
            subtitle: 'Sweet & Crunchy'
          },
          'Muffins': {
            description: 'Start your day right with our moist, flavorful muffins. Available in a variety of seasonal and classic flavors.',
            image: '/images/products/breads/cupcakes.png',
            subtitle: 'Morning Delights'
          },
          'Frozen Items': {
            description: 'Enjoy the convenience of baking at home with our frozen dough products! Just thaw, bake, and enjoy fresh bakery treats in the comfort of your home.',
            image: '/images/products/frozen-items/plain-paratha.png',
            subtitle: 'Bake at Home'
          }
        };

                return orderedCategories.map((category, index) => {
                  const categoryProducts = products.filter(p => 
                    p.category === category.name
                  );
                  
                  if (categoryProducts.length === 0) return null;
                  
                  const meta = categoryMeta[category.name] || {
                    description: 'Discover our delicious selection of baked goods in this category.',
                    image: 'https://coresg-normal.trae.ai/api/v1/text-to-image?prompt=general%20bakery%20products%20professional%20photography&image_size=square_hd',
                    subtitle: 'Fresh & Delicious'
                  };

                  const isEvenIndex = index % 2 === 0;

                  return (
                    <div key={category.id} className="mb-14 sm:mb-20 last:mb-0">
                      {/* Category Hero Section */}
                      <section className="mb-8 sm:mb-12">
                        <div className="max-w-7xl mx-auto">
                          {category.name === 'Cakes' || category.name === 'Pastries' ? (
                            /* Cakes and Pastries categories with reference style */
                            <div className="relative bg-white px-4 sm:px-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0">
                                {/* Image Side */}
                                <div className="relative h-56 sm:h-80 lg:h-auto overflow-hidden rounded-xl">
                                  <img 
                                    src={meta.image} 
                                    alt={category.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                {/* Text Side */}
                                <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12 bg-white rounded-xl">
                                  <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center gap-2">
                                      <div className="h-px w-6 sm:w-8 bg-amber-600"></div>
                                      <span className="text-amber-700 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                                        {meta.subtitle}
                                      </span>
                                      <div className="h-px w-6 sm:w-8 bg-amber-600"></div>
                                    </div>
                                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-stone-800" style={{ fontFamily: 'Fraunces, serif' }}>
                                      {category.name}
                                    </h2>
                                    <p className="text-xs sm:text-base text-stone-600 leading-relaxed">
                                      {meta.description}
                                    </p>
                                    <button 
                                      onClick={() => {
                                        setActiveCategory(category.name);
                                        scrollToCatalog();
                                      }}
                                      className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-amber-600 text-white text-xs sm:text-base font-semibold rounded transition-colors hover:bg-amber-700 w-fit"
                                    >
                                      Explore all {category.name.toLowerCase()}
                                      <ChevronRight size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Other categories with original style */
                            <div className="px-4 sm:px-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center bg-gradient-to-r from-[#F8F2E6] to-[#F1E7D4] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12">
                                {/* Image Container */}
                                <div className={`relative ${isEvenIndex ? 'order-1' : 'order-1 lg:order-2'}`}>
                                  <div className="absolute -inset-3 bg-gradient-to-r from-[#C9A227]/20 to-transparent rounded-3xl -z-10 blur-xl"></div>
                                  <img 
                                    src={meta.image} 
                                    alt={category.name}
                                    className="w-full aspect-square max-h-[350px] sm:max-h-none object-contain rounded-2xl shadow-xl mx-auto"
                                  />
                                </div>
                                {/* Text Container */}
                                <div className={`space-y-4 sm:space-y-6 ${isEvenIndex ? 'order-2' : 'order-2 lg:order-1'}`}>
                                  <div className="space-y-2">
                                    <span className="inline-block px-3 py-1 rounded-full bg-[#071326]/10 text-[#071326]/70 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
                                      {meta.subtitle}
                                    </span>
                                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#071326]" style={{ fontFamily: 'Fraunces, serif' }}>
                                      {category.name}
                                    </h2>
                                  </div>
                                  <p className="text-[#071326]/70 text-xs sm:text-lg leading-relaxed">
                                    {meta.description}
                                  </p>
                                  <button 
                                    onClick={() => {
                                      setActiveCategory(category.name);
                                      scrollToCatalog();
                                    }}
                                    className="flex items-center gap-2 text-[#C9A227] text-xs sm:text-base font-semibold cursor-pointer group hover:text-[#C9A227]/80 transition-colors"
                                  >
                                    <span>Explore all {category.name.toLowerCase()}</span>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Category Products Grid */}
                      <section className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                          {categoryProducts.map(p => (
                            <ProductCard key={p.id} product={p}
                              onAddToCart={(prod, qty, notes) => {
                                if (prod.category === 'Cakes') setCustomizingProduct(prod);
                                else handleAddToCart(prod, qty, notes || '');
                              }}
                              onQuickView={setCustomizingProduct}
                            />
                          ))}
                        </div>
                      </section>
                    </div>
                  );
                });
              })()}
            </section>
          )}

      {/* FULL CATALOG */}
      <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#071326]/50 flex items-center gap-1.5">
            <SlidersHorizontal size={13} /> Filters:
          </span>
          <button
            onClick={() => {
              setShowBestSellers(!showBestSellers);
              scrollToCatalog();
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 border ${
              showBestSellers ? 'border-[#071326] bg-[#071326] text-white' : 'border-[#071326]/20 text-[#071326]'
            }`}
          >
            <Flame size={12} /> Best Sellers
          </button>
          <button
            onClick={() => {
              setShowNewArrivals(!showNewArrivals);
              scrollToCatalog();
            }}
            className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 border ${
              showNewArrivals ? 'border-[#071326] bg-[#071326] text-white' : 'border-[#071326]/20 text-[#071326]'
            }`}
          >
            <Sparkles size={12} /> New Arrivals
          </button>
        </div>

        {/* Products Display: List if category selected, Grid otherwise */}
        {dataLoading ? (
          activeCategory !== 'all' ? (
            // List Loading State
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-[#071326]/10 bg-[#071326]/5 animate-pulse">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#071326]/10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 w-full">
                    <div className="h-4 bg-[#071326]/10 rounded w-1/3" />
                    <div className="h-3 bg-[#071326]/10 rounded w-full" />
                    <div className="h-3 bg-[#071326]/10 rounded w-1/2" />
                  </div>
                  <div className="w-full sm:w-24 h-10 bg-[#071326]/10 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            // Grid Loading State
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#071326]/5 border border-[#071326]/10 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[#071326]/5" />
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="h-2.5 bg-[#071326]/10 rounded w-1/3" />
                    <div className="h-4 bg-[#071326]/10 rounded w-3/4" />
                    <div className="h-3 bg-[#071326]/10 rounded w-full" />
                    <div className="h-3 bg-[#071326]/10 rounded w-2/3" />
                    <div className="h-9 bg-[#071326]/10 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-[#071326]/40">
            <Search size={40} className="opacity-30" />
            <div className="text-center">
              <h3 className="font-bold text-lg mb-1">No products found</h3>
              <p className="text-sm">Try adjusting your search or category filters.</p>
            </div>
          </div>
        ) : activeCategory !== 'all' ? (
          // List View (when category selected)
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 rounded-2xl border border-[#071326]/10 bg-white transition-all hover:bg-[#f4ead6]/30 hover:shadow-md"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl shrink-0 mx-auto sm:mx-0"
                />
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="font-semibold text-[#071326] text-base mb-1">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-[#071326]/60 mb-2">{product.description}</p>
                  <p className="text-base sm:text-lg font-bold text-[#C9A227]">Rs. {product.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    if (product.category === 'Cakes') setCustomizingProduct(product);
                    else handleAddToCart(product, 1, '');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#071326] text-white font-semibold text-xs sm:text-sm transition-colors hover:bg-[#071326]/90 shrink-0"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Grid View (default)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product}
                onAddToCart={(prod, qty, notes) => {
                  if (prod.category === 'Cakes') setCustomizingProduct(prod);
                  else handleAddToCart(prod, qty, notes || '');
                }}
                onQuickView={setCustomizingProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* SECTION 1: Stay Connected & Features */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Stay Connected Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#071326] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
              Stay Connected & Step Into Style
            </h2>
            <p className="text-xs sm:text-base text-[#071326]/60 max-w-2xl mx-auto">
              Subscribe to receive fresh updates, exclusive offers, and the latest from our oven — delivered straight to your inbox.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
            <div className="text-center p-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-[#071326]/5 flex items-center justify-center">
                <CakeSlice className="w-5 h-5 sm:w-6 sm:h-6 text-[#071326]" />
              </div>
              <h4 className="text-[#071326] font-semibold text-xs sm:text-sm mb-1">Custom Cakes</h4>
              <p className="text-[#071326]/50 text-[10px] sm:text-xs">Personalized designs for special occasions</p>
            </div>
            <div className="text-center p-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-[#071326]/5 flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#071326]" />
              </div>
              <h4 className="text-[#071326] font-semibold text-xs sm:text-sm mb-1">Free Delivery</h4>
              <p className="text-[#071326]/50 text-[10px] sm:text-xs">On Orders over Rs. 1,000 within city limits</p>
            </div>
            <div className="text-center p-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-[#071326]/5 flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#071326]" />
              </div>
              <h4 className="text-[#071326] font-semibold text-xs sm:text-sm mb-1">Fresh Daily</h4>
              <p className="text-[#071326]/50 text-[10px] sm:text-xs">Baked fresh every morning at 5 AM</p>
            </div>
            <div className="text-center p-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-[#071326]/5 flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#071326]" />
              </div>
              <h4 className="text-[#071326] font-semibold text-xs sm:text-sm mb-1">Award Winning</h4>
              <p className="text-[#071326]/50 text-[10px] sm:text-xs">Recognized for excellence in baking</p>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-[#071326]/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#071326] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
              Sign Up for Our Newsletter
            </h3>
            <p className="text-xs sm:text-base text-[#071326]/60 max-w-xl mx-auto mb-6">
              Get the latest updates on new products, special offers, and baking tips delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-[#071326]/20 bg-white text-xs sm:text-sm text-[#071326] outline-none focus:border-[#C9A227] transition-colors"
              />
              <button className="px-6 py-3 bg-[#071326] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#071326]/90 transition-colors w-full sm:w-auto shrink-0">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Gift a Cake */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#F8F2E6]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1">
              <img
                src="/images/gift-cake-woman.png"
                alt="Woman holding gift cake"
                className="rounded-2xl sm:rounded-3xl shadow-xl w-full max-h-[450px] object-cover"
              />
            </div>
            {/* Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#071326] mb-3 sm:mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                Gift a Cake, Spread the Joy
              </h2>
              <p className="text-xs sm:text-base text-[#071326]/60 mb-6">
                A Sweet Surprise for Your Loved Ones.
              </p>
              <div className="space-y-4 mb-6 sm:mb-8">
                <input
                  type="email"
                  placeholder="Enter recipient's email"
                  className="w-full px-4 py-3 rounded-lg border border-[#C9A227] bg-white text-xs sm:text-sm text-[#071326] outline-none focus:ring-2 focus:ring-[#C9A227]/50 transition-all"
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button className="flex-1 px-6 py-3 bg-[#071326] text-white text-xs sm:text-sm font-bold rounded-lg uppercase tracking-wider hover:bg-[#071326]/90 transition-colors">
                    SEND
                  </button>
                  <button 
                    onClick={() => {
                      setActiveCategory('Cakes');
                      scrollToCatalog();
                    }}
                    className="flex-1 px-6 py-3 bg-transparent border border-[#071326]/20 text-[#071326] text-xs sm:text-sm font-medium rounded-lg hover:bg-[#071326]/5 transition-colors"
                  >
                    Browse Custom Cake Options
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REDESIGNED FOOTER */}
      <footer className="bg-white py-10 sm:py-12 px-4 sm:px-6 border-t border-[#071326]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 sm:mb-12">
            {/* Logo & Brand */}
            <div>
              <img 
                src="/images/ma-bakers-white-logo.png" 
                alt="M.A BAKERS - Premium Frozen Foods" 
                className="h-14 sm:h-16 w-auto object-contain mb-2 text-[#071326]"
              />
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227] mb-3">
                Premium Frozen Foods & Bakery
              </p>
              <p className="text-[#071326]/60 text-xs sm:text-sm mb-2">+92 309 3660360</p>
              <p className="text-[#071326]/60 text-xs sm:text-sm mb-2">cake@mabakers.com</p>
              <p className="text-[#071326]/60 text-xs sm:text-sm">Nawabshah & Karachi, Pakistan</p>
              {/* Social Icons */}
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-8 h-8 rounded-full bg-[#071326]/10 flex items-center justify-center text-[#071326] hover:bg-[#071326] hover:text-white transition-all">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#071326]/10 flex items-center justify-center text-[#071326] hover:bg-[#071326] hover:text-white transition-all">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#071326]/10 flex items-center justify-center text-[#071326] hover:bg-[#071326] hover:text-white transition-all">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#071326]/10 flex items-center justify-center text-[#071326] hover:bg-[#071326] hover:text-white transition-all">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/></svg>
                </a>
              </div>
            </div>

            {/* Info Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#071326] mb-3 sm:mb-4">Info</h4>
              <ul className="space-y-2 text-[#071326]/60 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-[#071326] transition-colors">Company</a></li>
                <li><a href="#" className="hover:text-[#071326] transition-colors">Products</a></li>
                <li><a href="#" className="hover:text-[#071326] transition-colors">Brand Story</a></li>
                <li><a href="#" className="hover:text-[#071326] transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-[#071326] transition-colors">Franchisees</a></li>
              </ul>
            </div>

            {/* About Us Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#071326] mb-3 sm:mb-4">About Us</h4>
              <ul className="space-y-2 text-[#071326]/60 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-[#071326] transition-colors">Gallery</a></li>
                <li><a href="#" className="hover:text-[#071326] transition-colors">Shops</a></li>
                <li><a href="#" className="hover:text-[#071326] transition-colors">Contacts</a></li>
              </ul>
            </div>

            {/* Contact Form */}
            <div>
              <div className="border-2 border-[#071326] rounded-xl p-4">
                <h4 className="font-bold text-xs sm:text-sm text-[#071326] mb-3">Have Questions? Reach Out!</h4>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="w-full px-3 py-2 text-xs border border-[#071326] rounded bg-white text-[#071326] outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="w-full px-3 py-2 text-xs border border-[#071326] rounded bg-white text-[#071326] outline-none"
                  />
                  <button className="w-full px-4 py-2 bg-[#071326] text-white text-[11px] font-bold uppercase tracking-wider rounded hover:bg-[#071326]/90 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-[#071326]/10">
            <p className="text-[#071326]/40 text-xs">
              © {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onUpdateNotes={handleUpdateNotes}
        onRemove={handleRemove}
        onProceedToCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          onOrderPlaced={(order) => {
            setIsCheckoutOpen(false);
            setConfirmedOrder(order);
            saveCart([]);
            localStorage.removeItem('mab_coupon_code');
            localStorage.removeItem('mab_coupon_type');
            localStorage.removeItem('mab_coupon_value');
          }}
        />
      )}

      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
        />
      )}

      {customizingProduct && (
        <ProductCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Order Type and Location Modal */}
      <OrderTypeLocationModal
        isOpen={isOrderTypeModalOpen}
        onClose={() => setIsOrderTypeModalOpen(false)}
        onSelect={handleOrderTypeSelect}
      />
        </div>
      )}
    </>
  );
}

export default App;

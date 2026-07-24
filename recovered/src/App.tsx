import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTracking } from './components/OrderTracking';
import { AdminPanel } from './components/AdminPanel';
import { ProductCustomizerModal } from './components/ProductCustomizerModal';
import type { Product, Order } from './types';
import { API } from './services/api';
import { Search, SlidersHorizontal, Sparkles, Flame } from 'lucide-react';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [route, setRoute] = useState<'store' | 'admin' | 'track'>('store');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showBestSellers, setShowBestSellers] = useState(false);
  const [showNewArrivals, setShowNewArrivals] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    fetchData();
    const savedCart = localStorage.getItem('mab_cart_react');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([API.getProducts(), API.getCategories()]);
      setProducts(prodData);
      setCategories(catData);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('mab_cart_react', JSON.stringify(newCart));
  };

  const handleAddToCart = (product: Product, quantity: number, notes = '') => {
    const existing = cart.find(i => i.product.id === product.id && i.notes === notes);
    let newCart = [...cart];
    if (existing) {
      existing.quantity += quantity;
    } else {
      newCart.push({ product, quantity, notes });
    }
    saveCart(newCart);
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        const next = item.quantity + delta;
        return next > 0 ? { ...item, quantity: next } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(newCart);
  };

  const handleUpdateNotes = (productId: string, notes: string) => {
    saveCart(cart.map(i => i.product.id === productId ? { ...i, notes } : i));
  };

  const handleRemove = (productId: string) => {
    saveCart(cart.filter(i => i.product.id !== productId));
  };

  const filteredProducts = products.filter(p => {
    if (!p.available) return false;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchBest = !showBestSellers || p.best_seller;
    const matchNew = !showNewArrivals || p.new_arrival;
    return matchSearch && matchCat && matchBest && matchNew;
  });

  const featuredProducts = products.filter(p => p.featured && p.available);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (route === 'admin') {
    return <AdminPanel onBackToStore={() => { setRoute('store'); fetchData(); }} />;
  }

  if (route === 'track') {
    return <OrderTracking onBackToStore={() => setRoute('store')} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: '#111110', fontFamily: 'Inter, sans-serif' }}
         className="transition-colors duration-300">
      
      <Navbar 
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => setRoute('admin')}
        onTrackClick={() => setRoute('track')}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* HERO */}
      <header style={{ maxWidth: '1280px', margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C99A3E', fontWeight: 700 }}>
          Premium Artisan Bakery
        </span>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 700, lineHeight: 1.1, margin: '16px 0', color: '#111110' }}>
          Baked Fresh.<br />
          <em style={{ color: '#C99A3E', fontWeight: 500 }}>Delivered Daily.</em>
        </h1>
        <p style={{ color: '#7A746B', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontSize: 15 }}>
          Exquisite artisan bakes, slow-fermented breads, hand-rolled pastries and custom celebration cakes crafted since 1998.
        </p>
      </header>

      {/* FEATURED */}
      {featuredProducts.length > 0 && (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <Sparkles size={20} color="#C99A3E" />
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700 }}>Featured Selections</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
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

      {/* CATALOG */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        
        {/* Filter Bar */}
        <div style={{ borderBottom: '1px solid #E7E2D8', paddingBottom: 24, marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ id: 'all', name: 'All Items' }, ...categories].map(c => (
              <button key={c.id} onClick={() => setActiveCategory(c.name === 'All Items' ? 'all' : c.name)}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer',
                  border: 'none', transition: 'all 0.2s',
                  background: activeCategory === (c.name === 'All Items' ? 'all' : c.name) ? '#111110' : '#F0EDE8',
                  color: activeCategory === (c.name === 'All Items' ? 'all' : c.name) ? '#FFFFFF' : '#7A746B',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7A746B' }} />
            <input type="text" placeholder="Search bakes..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                border: 'none', borderRadius: 8, background: '#F0EDE8', fontSize: 13, outline: 'none',
                fontFamily: 'Inter, sans-serif', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#7A746B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={14} /> Filters:
          </span>
          <button onClick={() => setShowBestSellers(!showBestSellers)}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${showBestSellers ? '#C99A3E' : '#E7E2D8'}`,
              background: showBestSellers ? 'rgba(201,154,62,0.08)' : 'transparent',
              color: showBestSellers ? '#C99A3E' : '#7A746B',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
            }}
          >
            <Flame size={12} /> Best Sellers
          </button>
          <button onClick={() => setShowNewArrivals(!showNewArrivals)}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${showNewArrivals ? '#C99A3E' : '#E7E2D8'}`,
              background: showNewArrivals ? 'rgba(201,154,62,0.08)' : 'transparent',
              color: showNewArrivals ? '#C99A3E' : '#7A746B',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
            }}
          >
            <Sparkles size={12} /> New Arrivals
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #C99A3E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#7A746B' }}>
            <Search size={48} style={{ opacity: 0.3 }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>No products found</h3>
              <p style={{ fontSize: 14, margin: 0 }}>Try adjusting your search or category filters.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p}
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

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #E7E2D8', background: '#FFFFFF', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 48 }}>
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>M.A BAKERS</h3>
            <p style={{ color: '#7A746B', fontSize: 13, lineHeight: 1.7, margin: 0 }}>Premium artisan baked goods crafted since 1998 in Nawabshah, Sindh.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C99A3E', fontWeight: 700, margin: '0 0 16px' }}>Branches</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#7A746B', fontSize: 13, lineHeight: 2 }}>
              <li>Main Branch — Nawabshah</li>
              <li>Clifton Branch — Karachi</li>
              <li>Gulshan Branch — Karachi</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C99A3E', fontWeight: 700, margin: '0 0 16px' }}>Contact</h4>
            <p style={{ color: '#7A746B', fontSize: 13, lineHeight: 2, margin: 0 }}>
              WhatsApp: +92 334 2826675<br />
              info@mabakers.com
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C99A3E', fontWeight: 700, margin: '0 0 16px' }}>Newsletter</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="email" placeholder="Your email" style={{ flex: 1, padding: '10px 14px', border: '1px solid #E7E2D8', borderRadius: 6, fontSize: 13, outline: 'none', minWidth: 0 }} />
              <button style={{ background: '#111110', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }}>Join</button>
            </div>
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}
        items={cart} onUpdateQty={handleUpdateQty} onUpdateNotes={handleUpdateNotes}
        onRemove={handleRemove} onProceedToCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
      />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart} onOrderPlaced={(order) => { setIsCheckoutOpen(false); setConfirmedOrder(order); saveCart([]); }}
      />
      <OrderConfirmationModal order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />
      <ProductCustomizerModal product={customizingProduct} onClose={() => setCustomizingProduct(null)} onAddToCart={handleAddToCart} />
    </div>
  );
}

export default App;

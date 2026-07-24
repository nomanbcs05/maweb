import React, { useState, useEffect } from 'react';
import { ShoppingCart, Moon, Sun, Menu, X, MapPin } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  onTrackClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectedLocation: string;
  onOpenLocationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onCartClick,
  onAdminClick,
  onTrackClick,
  theme,
  toggleTheme,
  selectedLocation,
  onOpenLocationModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const savedUserLocation = localStorage.getItem('userLocation');
    if (savedUserLocation) {
      try {
        setUserLocation(JSON.parse(savedUserLocation));
      } catch (e) {
        console.error('Failed to parse user location:', e);
      }
    }
  }, []);

  const handleLocationClick = () => {
    if (userLocation) {
      // Open Google Maps with user's location
      const mapsUrl = `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
      window.open(mapsUrl, '_blank');
    }
    // Also open the location modal to let them change if needed
    onOpenLocationModal();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const hamburger = document.getElementById('hamburger');
      if (sidebar && !sidebar.contains(event.target as Node) && 
          hamburger && !hamburger.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-[#071326] transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex flex-col gap-4">
            <a href="#" className="text-white hover:text-[#D9D9D9] font-medium transition-colors uppercase tracking-widest text-sm py-2">
              Home
            </a>
            <a href="#" className="text-white hover:text-[#D9D9D9] font-medium transition-colors uppercase tracking-widest text-sm py-2">
              Menu
            </a>
            <a href="#" className="text-white hover:text-[#D9D9D9] font-medium transition-colors uppercase tracking-widest text-sm py-2">
              About
            </a>
            <button 
              onClick={onTrackClick}
              className="text-white hover:text-[#D9D9D9] font-medium transition-colors uppercase tracking-widest text-sm py-2 text-left"
            >
              Track Order
            </button>
            <button 
              onClick={onAdminClick}
              className="text-white hover:text-[#D9D9D9] font-medium transition-colors uppercase tracking-widest text-sm py-2 text-left"
            >
              Portal
            </button>
          </nav>
        </div>
      </div>

      {/* Navbar - transparent over hero, blurred on scroll */}
      <nav className={`sticky top-8 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#071326]/82 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.28)] border-b border-white/10'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-[70px] md:h-[85px] lg:h-[100px] flex items-center justify-between">
            
            {/* Left - Hamburger Button, Location & WhatsApp */}
            <div className="w-1/3 lg:w-1/4 flex items-center gap-2 sm:gap-3">
              <button 
                id="hamburger"
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-white transition-colors hover:text-[#D9D9D9]"
              >
                <Menu size={24} />
              </button>
              <button 
                onClick={handleLocationClick}
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <MapPin size={16} />
                <span className="text-xs font-semibold whitespace-nowrap">
                  {selectedLocation || 'Select Location'}
                </span>
              </button>
              <div className="hidden sm:block h-6 w-px bg-white/20"></div>
              <a 
                href="https://wa.me/03297040402" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .162 5.333.162 11.889c0 2.109.557 4.138 1.596 5.933L.05 24l6.269-1.643a11.833 11.833 0 005.728 1.464h.003c6.555 0 11.887-5.333 11.887-11.888A11.815 11.815 0 0020.88 3.488"/>
                </svg>
                <span className="text-xs font-semibold">
                  03297040402
                </span>
              </a>
            </div>

            {/* Center - Logo */}
            <button 
              onClick={() => window.location.reload()} 
              className="flex-shrink-0 group"
            >
              <div className="h-[52px] md:h-[72px] lg:h-[86px]">
                {/* EXACT LOGO - NO MODIFICATIONS */}
                <img 
                  src="/logo.png" 
                  alt="M.A BAKERS" 
                  className="h-full w-auto object-contain"
                />
              </div>
            </button>

            {/* Right - Actions */}
            <div className="w-1/3 lg:w-1/4 flex items-center justify-end gap-2 sm:gap-4">
              <button 
                onClick={toggleTheme}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-[#D9D9D9]"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <button 
                onClick={onCartClick}
                className="relative rounded-full border border-white/10 bg-white/5 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/10 hover:text-[#D9D9D9]"
                aria-label="Open Cart"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#071326] font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

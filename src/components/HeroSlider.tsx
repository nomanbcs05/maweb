import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: '/images/hero/hero-cake.png',
  },
  {
    id: 2,
    image: '/images/hero/hero-3-milk.png',
  },
  {
    id: 3,
    image: '/images/hero/hero-pastry.png',
  },
  {
    id: 4,
    image: '/images/hero/hero-dessert.png',
  },
  {
    id: 5,
    image: '/images/hero/hero-paratha.png',
  },
  {
    id: 6,
    image: '/images/hero/hero-paratha-51pcs.png',
  },
] as const;

interface HeroSliderProps {
  onSelectCategory?: (categoryName: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4200);

    return () => clearInterval(interval);
  }, [autoplay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section
      className="relative w-full min-h-[280px] h-[45vh] sm:min-h-[340px] sm:h-[52vh] md:h-[60vh] lg:h-[68vh] xl:h-[75vh] max-h-[900px] overflow-hidden bg-[#05070c]"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      {/* Full-bleed hero images */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt="M.A BAKERS Hero"
              className="h-full w-full object-cover object-center select-none"
              draggable={false}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'auto'}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Subtle edge vignette for polish */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black/15 via-transparent to-black/15" />

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-r-full border border-l-0 border-[#C9A227]/40 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-[#C9A227]/25 sm:h-9 sm:w-9"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} strokeWidth={2} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-l-full border border-r-0 border-[#C9A227]/40 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-[#C9A227]/25 sm:h-9 sm:w-9"
        aria-label="Next slide"
      >
        <ChevronRight size={18} strokeWidth={2} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-t-full border border-b-0 border-[#C9A227]/30 bg-black/30 px-3 py-1 backdrop-blur-md sm:gap-2 sm:px-3.5 sm:py-1.5">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-500 ${
              index === currentSlide
                ? 'h-1.5 w-6 bg-gradient-to-r from-[#C9A227] to-[#e6c86e] shadow-[0_0_8px_rgba(201,162,39,0.5)] sm:h-2 sm:w-7'
                : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/70 sm:h-2 sm:w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
